from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

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

@app.get("/api/lawyers", response_model=List[schemas.Lawyer])
def get_lawyers(db: Session = Depends(get_db)):
    """
    Récupère la liste de tous les avocats de l'annuaire.
    """
    return db.query(models.Lawyer).all()

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
    all_lawyers = db.query(models.Lawyer).all()
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
def get_lawyer_reviews(lawyer_id: int, db: Session = Depends(get_db)):
    """
    Récupère toutes les évaluations associées à un avocat spécifique.
    """
    # Verify lawyer exists
    db_lawyer = db.query(models.Lawyer).filter(models.Lawyer.id == lawyer_id).first()
    if not db_lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")
        
    reviews = db.query(models.Review).join(models.Mission).filter(models.Mission.lawyer_id == lawyer_id).all()
    return reviews


@app.post("/api/lawyers/{lawyer_id}/reviews", response_model=schemas.Review)
def create_lawyer_review(lawyer_id: int, review: schemas.LawyerReviewCreate, db: Session = Depends(get_db)):
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
