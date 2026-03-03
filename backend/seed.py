import datetime
from app.db.database import SessionLocal, engine, Base
from app.db.models import LawFirm, Lawyer, Mission, Review

import os

def seed_db():
    # Remove existing db to force recreation with new schema
    if os.path.exists("lexmetric.db"):
        os.remove("lexmetric.db")
        
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(LawFirm).first():
        print("Database already seeded!")
        return
        
    print("Seeding database...")
    
    # 1. Law Firms
    firm1 = LawFirm(name="Cabinet Dupont & Associés", size=15)
    firm2 = LawFirm(name="LexCorp Paris", size=45)
    firm3 = LawFirm(name="Martin Legal", size=5)
    
    db.add_all([firm1, firm2, firm3])
    db.commit()
    
    # Refresh to get IDs
    db.refresh(firm1)
    db.refresh(firm2)
    db.refresh(firm3)
    
    # 2. Lawyers
    lawyers_data = [
        Lawyer(first_name="Jean", last_name="Dupont", bar_association="Paris", 
               city="Paris", firm_type="Cabinet Associé",
               oath_date=datetime.date(2010, 1, 1), specialties=["Préjudice Corporel", "RC"], 
               in_network=True, average_hourly_rate=250.0, law_firm_id=firm1.id),
               
        Lawyer(first_name="Marie", last_name="Curie", bar_association="Lyon", 
               city="Lyon", firm_type="Cabinet Associé",
               oath_date=datetime.date(2015, 5, 12), specialties=["Préjudice Corporel", "Droit du Travail"], 
               in_network=False, average_hourly_rate=300.0, law_firm_id=firm2.id),
               
        Lawyer(first_name="Paul", last_name="Lefebvre", bar_association="Marseille", 
               city="Aix-en-Provence", firm_type="Individuel",
               oath_date=datetime.date(2020, 9, 1), specialties=["Préjudice Corporel", "Construction", "RC Décennale"], 
               in_network=True, average_hourly_rate=180.0, law_firm_id=None),
               
        Lawyer(first_name="Sophie", last_name="Martin", bar_association="Bordeaux", 
               city="Bordeaux", firm_type="Cabinet Associé",
               oath_date=datetime.date(2005, 11, 23), specialties=["RC Décennale", "Droit Commercial"], 
               in_network=True, average_hourly_rate=350.0, law_firm_id=firm3.id),
               
        Lawyer(first_name="Lucas", last_name="Bernard", bar_association="Paris", 
               city="Paris", firm_type="Cabinet Associé",
               oath_date=datetime.date(2018, 3, 15), specialties=["Droit du Travail", "RC"], 
               in_network=False, average_hourly_rate=220.0, law_firm_id=firm1.id),
               
        Lawyer(first_name="Emma", last_name="Petit", bar_association="Lille", 
               city="Lille", firm_type="Cabinet Associé",
               oath_date=datetime.date(2022, 1, 10), specialties=["Préjudice Corporel", "Droit Commercial"], 
               in_network=True, average_hourly_rate=150.0, law_firm_id=firm2.id),
    ]
    
    db.add_all(lawyers_data)
    db.commit()
    
    for l in lawyers_data:
        db.refresh(l)
        
    print(f"Added {len(lawyers_data)} lawyers successfully.")
    
    # 3. Add some Mock Missions and Reviews to show Dashboard Data later
    mission1 = Mission(lawyer_id=lawyers_data[0].id, status="Terminé", financial_stakes=150000)
    mission2 = Mission(lawyer_id=lawyers_data[1].id, status="Terminé", financial_stakes=85000)
    mission3 = Mission(lawyer_id=lawyers_data[3].id, status="Terminé", financial_stakes=420000)
    
    db.add_all([mission1, mission2, mission3])
    db.commit()
    
    db.refresh(mission1)
    db.refresh(mission2)
    db.refresh(mission3)
    
    review1 = Review(mission_id=mission1.id, reactivity_score=5, technical_expertise_score=4, 
                     negotiation_score=5, fee_respect_score=5, comment="Excellent travail pour une belle indemnisation.")
    review2 = Review(mission_id=mission2.id, reactivity_score=3, technical_expertise_score=5, 
                     negotiation_score=4, fee_respect_score=3, comment="Bonne technique mais factures un peu au-dessus du devis initial.")
    review3 = Review(mission_id=mission3.id, reactivity_score=5, technical_expertise_score=5, 
                     negotiation_score=5, fee_respect_score=4, comment="Impeccable.")
                     
    db.add_all([review1, review2, review3])
    db.commit()
    
    print("Successfully seeded Lawyer and LawFirm data + 3 historical missions for scoring.")

if __name__ == "__main__":
    seed_db()
