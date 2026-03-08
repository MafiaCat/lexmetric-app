import csv
import io
import json
from fastapi import FastAPI, Depends, Query, HTTPException, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db, engine, Base
from app.db import models
from app.schemas import schemas
from app.core.scoring import calculate_lawyer_score

# Création des tables dans la base documentaire locale (Pour dev sans migrations alembic temporairement)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LexMetric API", 
    description="SaaS B2B pour la sélection d'avocats par la data", 
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "LexMetric API is running."}

@app.get("/api/auth/demo-users", response_model=List[schemas.User])
def get_demo_users(db: Session = Depends(get_db)):
    """
    Renvoie la liste des utilisateurs de démonstration disponibles.
    Permet de se connecter facilement en un clic côté Frontend.
    """
    return db.query(models.User).all()

import math

@app.get("/api/lawyers", response_model=schemas.LawyerPaginatedResponse)
def get_lawyers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste paginée de tous les avocats de l'annuaire (approuvés uniquement).
    """
    query = db.query(models.Lawyer).filter(models.Lawyer.status == "approved")
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Lawyer.first_name.ilike(search_filter)) |
            (models.Lawyer.last_name.ilike(search_filter)) |
            (models.Lawyer.city.ilike(search_filter)) |
            (models.Lawyer.bar_association.ilike(search_filter))
        )
        
    total = query.count()
    pages = math.ceil(total / size) if size > 0 else 0
    offset = (page - 1) * size
    
    lawyers = query.offset(offset).limit(size).all()
    
    return {
        "items": lawyers,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@app.post("/api/lawyers", response_model=schemas.Lawyer)
def create_lawyer(lawyer: schemas.LawyerCreate, db: Session = Depends(get_db)):
    """
    Simule la demande d'ajout d'un avocat. 
    Dans le MVP, on l'ajoute directement à la base de données.
    """
    db_lawyer = models.Lawyer(**lawyer.dict())
    db.add(db_lawyer)
    db.commit()
    db.refresh(db_lawyer)
    return db_lawyer

@app.get("/api/lawyers/search", response_model=List[schemas.LawyerSearchResponse])
def search_lawyers(
    specialty: str = Query(..., description="Spécialité juridique requise, ex: 'Préjudice Corporel'"),
    complexity: int = Query(3, ge=1, le=5, description="Complexité du dossier (1-5)"),
    financial_stakes: float = Query(..., description="Enjeu financier du sinistre en euros"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Recherche d'avocats basée sur la spécialité.
    Le moteur d'intelligence LexMetric attribue un 'Matching Score' à chaque résultat pertinent.
    Les avocats sont retournés du plus pertinent (Score 100) au moins pertinent.
    """
    # 1. Utilisation du textulaire SQLite avec JSON_EACH pour fouiller dans le tableau JSON "specialties"
    # Cela évite de transférer 80 000 entrées en mémoire Python.
    import json
    from sqlalchemy import text
    
    # Simple workaround for sqlite JSON since JSON type matching can be tricky via ORM directly
    all_lawyers = db.query(models.Lawyer).filter(models.Lawyer.status == "approved").all()
    filtered_lawyers = [
        lawyer for lawyer in all_lawyers 
        if lawyer.specialties and specialty in lawyer.specialties
    ]
    
    # We only take the top 50 in memory to score them instead of the thousands
    filtered_lawyers = filtered_lawyers[:50]
    
    scored_lawyers = []
    
    # 2. Assignation des scores (Matching Score)
    for l in filtered_lawyers:
        score = calculate_lawyer_score(
            lawyer=l,
            case_complexity=complexity,
            case_financial_stakes=financial_stakes,
            db=db
        )
        
        # Format de sortie
        lawyer_data = schemas.LawyerSearchResponse(
            id=l.id,
            first_name=l.first_name,
            last_name=l.last_name,
            bar_association=l.bar_association,
            city=l.city,
            firm_type=l.firm_type,
            oath_date=l.oath_date,
            specialties=l.specialties,
            in_network=l.in_network,
            average_hourly_rate=l.average_hourly_rate,
            law_firm_id=l.law_firm_id,
            status=l.status,
            source=l.source,
            is_verified=l.is_verified,
            matching_score=score
        )
        scored_lawyers.append(lawyer_data)
        
    # 3. Tri final par ordre décroissant de pertinence
    scored_lawyers.sort(key=lambda x: x.matching_score, reverse=True)
    
    return scored_lawyers[:limit]

@app.post("/api/reviews", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    db_mission = db.query(models.Mission).filter(models.Mission.id == review.mission_id).first()
    if not db_mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    # Check if a review already exists
    existing_review = db.query(models.Review).filter(models.Review.mission_id == review.mission_id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="Review already exists for this mission")
        
    db_review = models.Review(
        mission_id=review.mission_id,
        reactivity_score=review.reactivity_score,
        technical_expertise_score=review.technical_expertise_score,
        negotiation_score=review.negotiation_score,
        fee_respect_score=review.fee_respect_score,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@app.get("/api/lawyers/{lawyer_id}/reviews", response_model=List[schemas.Review])
def get_lawyer_reviews(
    lawyer_id: int, 
    x_company_id: Optional[int] = Header(None, description="ID de l'entreprise connectée pour filtrer les avis"),
    db: Session = Depends(get_db)
):
    """
    Récupère toutes les évaluations associées à un avocat spécifique.
    Filtre par entreprise si le header x-company-id est fourni.
    """
    # Verify lawyer exists
    db_lawyer = db.query(models.Lawyer).filter(models.Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    query = db.query(models.Review).join(models.Mission).filter(models.Mission.lawyer_id == lawyer_id)
    
    # MULTI-TENANT FILTERING
    if x_company_id:
        query = query.filter(models.Review.company_id == x_company_id)
        
    return query.all()


@app.post("/api/lawyers/{lawyer_id}/reviews", response_model=schemas.Review)
def create_lawyer_review(
    lawyer_id: int, 
    review: schemas.LawyerReviewCreate, 
    x_company_id: Optional[int] = Header(None, description="ID de l'entreprise qui laisse l'avis"),
    db: Session = Depends(get_db)
):
    """
    Raccourci MVP: Permet d'évaluer directement un avocat ou de modifier son évaluation existante.
    """
    # Verify lawyer exists
    db_lawyer = db.query(models.Lawyer).filter(models.Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    # See if the lawyer already has a review (for this MVP, we assume 1 review per lawyer per user max, 
    # and since we don't have auth, we just check if ANY review exists for this lawyer via fake missions)
    existing_mission = db.query(models.Mission).filter(models.Mission.lawyer_id == lawyer_id, models.Mission.status == "Terminé").first()
    
    if existing_mission:
        # Check if it has a review
        existing_review = db.query(models.Review).filter(models.Review.mission_id == existing_mission.id).first()
        if existing_review:
            # Update existing review including new factual fields
            existing_review.reactivity_score = review.reactivity_score
            existing_review.technical_expertise_score = review.technical_expertise_score
            existing_review.negotiation_score = review.negotiation_score
            existing_review.fee_respect_score = review.fee_respect_score
            existing_review.comment = review.comment
            existing_review.actual_fees_paid = review.actual_fees_paid
            existing_review.fee_billing_type = review.fee_billing_type
            existing_review.mission_type = review.mission_type
            existing_review.mission_outcome = review.mission_outcome
            existing_review.mission_duration_days = review.mission_duration_days
            existing_review.would_recommend = review.would_recommend
            
            db.commit()
            db.refresh(existing_review)
            return existing_review

    # Create fake mission if it didn't exist
    if not existing_mission:
        existing_mission = models.Mission(
            lawyer_id=lawyer_id,
            status="Terminé",
            financial_stakes=50000.0
        )
        db.add(existing_mission)
        db.commit()
        db.refresh(existing_mission)
    
    # Create review for that mission
    db_review = models.Review(
        mission_id=existing_mission.id,
        company_id=x_company_id,
        reactivity_score=review.reactivity_score,
        technical_expertise_score=review.technical_expertise_score,
        negotiation_score=review.negotiation_score,
        fee_respect_score=review.fee_respect_score,
        comment=review.comment,
        actual_fees_paid=review.actual_fees_paid,
        fee_billing_type=review.fee_billing_type,
        mission_type=review.mission_type,
        mission_outcome=review.mission_outcome,
        mission_duration_days=review.mission_duration_days,
        would_recommend=review.would_recommend,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


@app.get("/api/lawyers/{lawyer_id}/stats", response_model=schemas.LawyerStats)
def get_lawyer_stats(lawyer_id: int, db: Session = Depends(get_db)):
    """
    Statistiques publiques agrégées pour un avocat à partir des évaluations.
    """
    db_lawyer = db.query(models.Lawyer).filter(models.Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    reviews = (
        db.query(models.Review)
        .join(models.Mission)
        .filter(models.Mission.lawyer_id == lawyer_id)
        .all()
    )

    count = len(reviews)
    if count == 0:
        return schemas.LawyerStats(review_count=0)

    def avg(values):
        vals = [v for v in values if v is not None]
        return round(sum(vals) / len(vals), 2) if vals else None

    def median(values):
        vals = sorted([v for v in values if v is not None])
        if not vals:
            return None
        mid = len(vals) // 2
        return vals[mid] if len(vals) % 2 else (vals[mid - 1] + vals[mid]) / 2

    def distrib(values):
        result = {}
        for v in values:
            if v is not None:
                result[v] = result.get(v, 0) + 1
        return result

    recommend_vals = [r.would_recommend for r in reviews if r.would_recommend is not None]
    recommend_rate = round(sum(recommend_vals) / len(recommend_vals) * 100, 1) if recommend_vals else None

    return schemas.LawyerStats(
        review_count=count,
        avg_reactivity=avg([r.reactivity_score for r in reviews]),
        avg_technical=avg([r.technical_expertise_score for r in reviews]),
        avg_negotiation=avg([r.negotiation_score for r in reviews]),
        avg_fee_respect=avg([r.fee_respect_score for r in reviews]),
        recommend_rate=recommend_rate,
        median_fees_paid=median([r.actual_fees_paid for r in reviews]),
        avg_mission_duration_days=avg([r.mission_duration_days for r in reviews]),
        mission_outcome_distribution=distrib([r.mission_outcome for r in reviews]),
        mission_type_distribution=distrib([r.mission_type for r in reviews]),
        fee_billing_type_distribution=distrib([r.fee_billing_type for r in reviews]),
    )

# --- MODERATION & TICKETS API --- #

@app.get("/api/moderation/lawyers/pending", response_model=List[schemas.Lawyer])
def get_pending_lawyers(db: Session = Depends(get_db)):
    """
    Modérateur : Liste tous les avocats en attente de validation.
    """
    return db.query(models.Lawyer).filter(models.Lawyer.status == "pending").all()

@app.put("/api/moderation/lawyers/{lawyer_id}/status", response_model=schemas.Lawyer)
def update_lawyer_status(lawyer_id: int, status_update: schemas.LawyerStatusUpdate, db: Session = Depends(get_db)):
    """
    Modérateur : Approuver ou rejeter le profil.
    """
    db_lawyer = db.query(models.Lawyer).filter(models.Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    db_lawyer.status = status_update.status
    db.commit()
    db.refresh(db_lawyer)
    return db_lawyer

def verify_admin(x_user_role: str = Header(None)):
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden. Admin access required.")
    return True

@app.put("/api/admin/lawyers/{lawyer_id}", response_model=schemas.Lawyer)
def update_lawyer_details(lawyer_id: int, lawyer_update: schemas.LawyerUpdate, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """
    Modérateur : Mettre à jour les informations d'un cabinet/avocat.
    """
    db_lawyer = db.query(models.Lawyer).filter(models.Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    update_data = lawyer_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lawyer, key, value)
        
    db.commit()
    db.refresh(db_lawyer)
    
    # Trace the action
    audit_log = models.AuditLog(
        user_id=1,
        action="UPDATE_LAWYER",
        target_resource=f"Lawyer ID {lawyer_id} updated"
    )
    db.add(audit_log)
    db.commit()
    
    return db_lawyer

@app.get("/api/moderation/tickets", response_model=List[schemas.SupportTicket])
def get_all_tickets(db: Session = Depends(get_db)):
    """
    Modérateur : Liste tous les tickets de support.
    """
    return db.query(models.SupportTicket).order_by(models.SupportTicket.created_at.desc()).all()

@app.put("/api/moderation/tickets/{ticket_id}/status", response_model=schemas.SupportTicket)
def update_ticket_status(ticket_id: int, status_update: schemas.SupportTicketStatusUpdate, db: Session = Depends(get_db)):
    """
    Modérateur : Mettre à jour le statut d'un ticket.
    """
    db_ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db_ticket.status = status_update.status
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.post("/api/tickets", response_model=schemas.SupportTicket)
def create_ticket(
    ticket: schemas.SupportTicketCreate,
    x_user_id: int = Header(..., description="ID de l'utilisateur qui crée le ticket"),
    x_company_id: int = Header(..., description="ID de l'entreprise"),
    db: Session = Depends(get_db)
):
    """
    Gestionnaire : Créer un nouveau ticket de support ou signalement.
    """
    db_ticket = models.SupportTicket(**ticket.dict(), user_id=x_user_id, company_id=x_company_id)
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.get("/api/users/me/tickets", response_model=List[schemas.SupportTicket])
def get_my_tickets(
    x_user_id: int = Header(..., description="ID de l'utilisateur qui récupère ses tickets"),
    db: Session = Depends(get_db)
):
    """
    Gestionnaire : Récupérer ses propres tickets de support.
    """
    return db.query(models.SupportTicket).filter(models.SupportTicket.user_id == x_user_id).order_by(models.SupportTicket.created_at.desc()).all()

@app.get("/api/tickets/{ticket_id}/messages", response_model=List[schemas.TicketMessage])
def get_ticket_messages(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    """
    Récupère tous les messages d'un ticket spécifique, triés par date de création.
    """
    messages = db.query(models.TicketMessage).filter(models.TicketMessage.ticket_id == ticket_id).order_by(models.TicketMessage.created_at.asc()).all()
    return messages

@app.post("/api/tickets/{ticket_id}/messages", response_model=schemas.TicketMessage)
def create_ticket_message(
    ticket_id: int,
    message: schemas.TicketMessageCreate,
    x_user_id: int = Header(..., description="ID de l'utilisateur qui envoie le message"),
    db: Session = Depends(get_db)
):
    """
    Ajoute un nouveau message au fil de discussion d'un ticket.
    """
    # Verify ticket exists
    db_ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db_message = models.TicketMessage(
        ticket_id=ticket_id,
        sender_id=x_user_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

# --- ADMIN SUPERPOWERS & STATS API --- #

@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """
    Modérateur : Récupère les métriques globales de la plateforme.
    """
    total_users = db.query(models.User).count()
    total_companies = db.query(models.Company).count()
    total_lawyers = db.query(models.Lawyer).count()
    pending_lawyers = db.query(models.Lawyer).filter(models.Lawyer.status == "pending").count()
    total_reviews = db.query(models.Review).count()
    open_tickets = db.query(models.SupportTicket).filter(models.SupportTicket.status == "open").count()
    
    return {
        "total_users": total_users,
        "total_companies": total_companies,
        "total_lawyers": total_lawyers,
        "pending_lawyers": pending_lawyers,
        "total_reviews": total_reviews,
        "open_tickets": open_tickets
    }

@app.post("/api/admin/lawyers/bulk", status_code=201)
async def upload_lawyers_bulk(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    is_admin: bool = Depends(verify_admin)
):
    """
    Modérateur : Importer une liste d'avocats depuis un CSV.
    Le fichier doit contenir: first_name, last_name, bar_association, city, specialties (json), average_hourly_rate
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV.")

    contents = await file.read()
    try:
        decoded = contents.decode('utf-8')
    except Exception:
        decoded = contents.decode('latin1')

    # Read CSV
    reader = csv.DictReader(io.StringIO(decoded), delimiter=',')
    
    created_count = 0
    for row in reader:
        # Standardise specialties parsing
        specialties = []
        if 'specialties' in row and row['specialties']:
            try:
                # Support "['Droit des assurances', 'Droit de la construction']" format or just comma separated
                if row['specialties'].startswith('['):
                    specialties = json.loads(row['specialties'].replace("'", '"'))
                else:
                    specialties = [s.strip() for s in row['specialties'].split(',')]
            except Exception:
                specialties = [row['specialties']]

        rate = 200.0
        if 'average_hourly_rate' in row and row['average_hourly_rate']:
            try:
                rate = float(row['average_hourly_rate'])
            except:
                pass

        lawyer = models.Lawyer(
            first_name=row.get('first_name', 'Unknown'),
            last_name=row.get('last_name', 'Unknown'),
            bar_association=row.get('bar_association', 'Paris'),
            city=row.get('city', 'Paris'),
            specialties=specialties,
            average_hourly_rate=rate,
            in_network=str(row.get('in_network', '')).lower() == 'true',
            status="approved" # Autovalidé vu que c'est le modo qui importe
        )
        db.add(lawyer)
        created_count += 1
        
    db.commit()
    
    # Try to extract the user_id of the admin making the request (using a dummy ID 1 if not passed for MVP)
    # Ideally, would extract x-user-id from headers if passed from frontend
    admin_id = 1 
    # Log the action
    audit_log = models.AuditLog(
        user_id=admin_id,
        action="IMPORT_LAWYERS_CSV",
        target_resource=f"{created_count} lawyers imported"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Import successful", "created": created_count}

@app.get("/api/admin/audit-logs", response_model=List[schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """
    Modérateur : Consulte l'historique des actions de modération.
    """
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(100).all()

@app.get("/api/admin/reviews", response_model=List[schemas.Review])
def get_all_reviews(db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """
    Modérateur : Récupère tous les avis pour les modérer.
    """
    return db.query(models.Review).order_by(models.Review.created_at.desc()).all()

@app.delete("/api/admin/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """
    Modérateur : Supprime un avis abusif ou inapproprié.
    """
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    db.delete(db_review)
    db.commit()
    
    # Log the action (hardcoded admin_id=1 for MVP)
    audit_log = models.AuditLog(
        user_id=1,
        action="DELETE_REVIEW",
        target_resource=f"Review ID {review_id} deleted"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Review deleted successfully"}


# --- FIRM MANAGEMENT API --- #

@app.get("/api/firms", response_model=schemas.LawFirmPaginatedResponse)
def get_firms(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des cabinets (paginée).
    """
    query = db.query(models.LawFirm)
    if search:
        query = query.filter(models.LawFirm.name.ilike(f"%{search}%"))
    
    total = query.count()
    pages = (total + size - 1) // size
    items = query.offset((page - 1) * size).limit(size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@app.post("/api/admin/firms", response_model=schemas.LawFirm)
def create_firm(firm: schemas.LawFirmCreate, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """
    Modérateur : Créer un nouveau cabinet.
    """
    db_firm = models.LawFirm(**firm.dict())
    db.add(db_firm)
    db.commit()
    db.refresh(db_firm)
    return db_firm

@app.put("/api/admin/firms/{firm_id}", response_model=schemas.LawFirm)
def update_firm(firm_id: int, firm_update: schemas.LawFirmBase, db: Session = Depends(get_db), is_admin: bool = Depends(verify_admin)):
    """
    Modérateur : Mettre à jour les informations d'un cabinet.
    """
    db_firm = db.query(models.LawFirm).filter(models.LawFirm.id == firm_id).first()
    if not db_firm:
        raise HTTPException(status_code=404, detail="Firm not found")
        
    for key, value in firm_update.dict(exclude_unset=True).items():
        setattr(db_firm, key, value)
        
    db.commit()
    db.refresh(db_firm)
    return db_firm


