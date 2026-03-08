import csv
import json
import logging
import os
import sys
from datetime import datetime

# Setup paths to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine, Base
from app.db.models import Lawyer

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
CSV_FILE_PATH = "base_de_donnees_avocats.csv"
BATCH_SIZE = 2000

def clean_date(date_str):
    if not date_str or date_str.strip() == "":
        return None
    try:
        # Assuming format is DD/MM/YYYY based on typical french datasets
        # Adjust format string if inspection shows otherwise (e.g. YYYY-MM-DD)
        return datetime.strptime(date_str.strip(), "%d/%m/%Y").date()
    except ValueError:
        # Try alternate formats if needed
        try:
             return datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
        except ValueError:
             logger.warning(f"Impossible de parser la date: {date_str}")
             return None

def import_csv_to_db():
    if not os.path.exists(CSV_FILE_PATH):
        logger.error(f"Fichier non trouvé: {CSV_FILE_PATH}")
        return

    # Create tables if not exists
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Optional: Clear existing imports? (Dangerous on prod, safe to skip since we deduplicate or just insert)
    # For this script we will just append and rely on chunking. 
    # If a previous run failed halfway, it's better to clear specific sources or use UPSERT.
    # To keep it simple and safe for the first run, we just insert.
    
    lawyers_to_insert = []
    total_processed = 0
    total_inserted = 0

    logger.info("Début de la lecture du fichier CSV...")

    with open(CSV_FILE_PATH, mode="r", encoding="utf-8-sig") as file:
        # Use DictReader with semicolon delimiter
        csv_reader = csv.DictReader(file, delimiter=";")
        
        for row in csv_reader:
            total_processed += 1
            
            # --- Field Mapping ---
            # Extract specialties (up to 3 distinct columns)
            specialties = []
            for col in ['spLibelle1', 'spLibelle2', 'spLibelle3']:
                if row.get(col) and row[col].strip():
                    specialties.append(row[col].strip())
                    
            firm_type = row.get('cbRaisonSociale', '').strip() or "Indépendant"

            lawyer_data = {
                 "first_name": row.get('avPrenom', '').strip() or "Prénom inconnu",
                 "last_name": row.get('avNom', '').strip() or "Nom inconnu",
                 "bar_association": row.get('NomBarreau', '').strip() or "Barreau inconnu",
                 "city": row.get('cbVille', '').strip() or "Ville inconnue",
                 "firm_type": firm_type,
                 "oath_date": clean_date(row.get('acDateSerment', '')),
                 "specialties": specialties,
                 "in_network": False,
                 "average_hourly_rate": 0.0,
                 "status": "approved",           # Approved state as requested
                 "source": "cnb_import",         # Strategic separation
                 "is_verified": False            # Public data, not claimed by user
            }

            lawyers_to_insert.append(Lawyer(**lawyer_data))

            # Batch Insert
            if len(lawyers_to_insert) >= BATCH_SIZE:
                 try:
                     db.bulk_save_objects(lawyers_to_insert)
                     db.commit()
                     total_inserted += len(lawyers_to_insert)
                     logger.info(f"Inséré {total_inserted} avocats...")
                     lawyers_to_insert.clear()
                 except Exception as e:
                     db.rollback()
                     logger.error(f"Erreur lors de l'insertion du lot: {e}")
                     lawyers_to_insert.clear()

        # Insert remaining
        if lawyers_to_insert:
             try:
                 db.bulk_save_objects(lawyers_to_insert)
                 db.commit()
                 total_inserted += len(lawyers_to_insert)
                 logger.info(f"Inséré les {len(lawyers_to_insert)} derniers avocats.")
             except Exception as e:
                 db.rollback()
                 logger.error(f"Erreur lors de l'insertion du dernier lot: {e}")

    logger.info(f"--- Terminé ---")
    logger.info(f"Total lignes traitées : {total_processed}")
    logger.info(f"Total avocats insérés : {total_inserted}")
    db.close()

if __name__ == "__main__":
    import_csv_to_db()
