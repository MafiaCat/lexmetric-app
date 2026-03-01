from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import Lawyer, Review, Mission

def calculate_lawyer_score(lawyer: Lawyer, case_complexity: int, case_financial_stakes: float, db: Session) -> float:
    """
    Calcule un 'Matching Score' sur 100 pour un avocat par rapport à un dossier.
    Pondération :
    - 30% Expertise (Ancienneté et adéquation avec complexité)
    - 30% Résultats (Avis: Réactivité + Négociation + Expertise technique)
    - 20% Coût (Respect des honoraires, Taux horaire vs Enjeux)
    - 20% Réseau (Appartenance au réseau)
    """
    score = 0.0
    
    # 1. Expertise (30 points)
    # L'ancienneté (approximative) compte dans l'expertise
    years_of_experience = (date.today() - lawyer.oath_date).days / 365.25 if lawyer.oath_date else 0
    # Plafond de l'expérience à 20 ans pour 30 points (1.5 point par an)
    expertise_score = min(years_of_experience * 1.5, 30.0)
    score += expertise_score
    
    # Récupérer les notes moyennes de cet avocat via la DB
    avg_scores = db.query(
        func.avg(Review.reactivity_score).label("reactivity"),
        func.avg(Review.technical_expertise_score).label("tech"),
        func.avg(Review.negotiation_score).label("nego"),
        func.avg(Review.fee_respect_score).label("fee")
    ).join(Mission).filter(Mission.lawyer_id == lawyer.id).first()
    
    # 2. Résultats / Avis (30 points)
    if avg_scores and avg_scores.reactivity:
        # Somme sur 15 (5 pour réactivité, 5 tech, 5 négo)
        results_raw = (avg_scores.reactivity + avg_scores.tech + avg_scores.nego) / 15.0
        score += results_raw * 30.0
    else:
        # Score par défaut si aucun avis
        score += 20.0
    
    # 3. Coût (20 points)
    # Pondération: 10 points sur le respect des honoraires passés, 10 points sur l'efficacité du taux horaire
    fee_respect = (avg_scores.fee / 5.0) if (avg_scores and avg_scores.fee) else 0.8 # Défaut à 4/5
    cost_efficiency = max(0, 10.0 - (lawyer.average_hourly_rate / 60.0)) # Formule purement illustrative
    cost_score = min(cost_efficiency + (fee_respect * 10.0), 20.0)
    score += cost_score
    
    # 4. Bonus Réseau (20 points)
    # L'appartenance au réseau de l'assureur est un critère de sélection fort
    if lawyer.in_network:
        score += 20.0
    else:
        score += 5.0 # Petit score par défaut
        
    return round(min(score, 100.0), 2)
