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

@app.get("/api/lawyers", response_model=List[schemas.Lawyer])
def get_lawyers(db: Session = Depends(get_db)):
    """
    Récupère la liste de tous les avocats de l'annuaire (approuvés uniquement).
    """
    return db.query(models.Lawyer).filter(models.Lawyer.status == "approved").all()

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
    db: Session = Depends(get_db)
):
    """
    Recherche d'avocats basée sur la spécialité.
    Le moteur d'intelligence LexMetric attribue un 'Matching Score' à chaque résultat pertinent.
    Les avocats sont retournés du plus pertinent (Score 100) au moins pertinent.
    """
    # 1. Récupération des avocats (Dans une vraie DB, le filtrage JSON s'effectue côté SQL)
    all_lawyers = db.query(models.Lawyer).filter(models.Lawyer.status == "approved").all()
    filtered_lawyers = [
        lawyer for lawyer in all_lawyers 
        if lawyer.specialties and specialty in lawyer.specialties
    ]
    
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
            oath_date=l.oath_date,
            specialties=l.specialties,
            in_network=l.in_network,
            average_hourly_rate=l.average_hourly_rate,
            law_firm_id=l.law_firm_id,
            matching_score=score
        )
        scored_lawyers.append(lawyer_data)
        
    # 3. Tri final par ordre décroissant de pertinence
    scored_lawyers.sort(key=lambda x: x.matching_score, reverse=True)
    
    return scored_lawyers

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
            # Update existing review
            existing_review.reactivity_score = review.reactivity_score
            existing_review.technical_expertise_score = review.technical_expertise_score
            existing_review.negotiation_score = review.negotiation_score
            existing_review.fee_respect_score = review.fee_respect_score
            existing_review.comment = review.comment
            
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
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

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

def verify_admin(x_user_role: str = Header(None)):
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden. Admin access required.")
    return True

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

