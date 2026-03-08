import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.db.models import Lawyer

def test():
    db = SessionLocal()
    try:
        print("Querying lawyers...")
        lawyers = db.query(Lawyer).filter(Lawyer.id >= 80563).limit(5).all()
        print(f"Found {len(lawyers)} lawyers")
        from app.schemas.schemas import Lawyer as LawyerSchema
        for l in lawyers:
            print(f"Validating {l.id}...")
            print(f"Oath date value: {repr(l.oath_date)} Type: {type(l.oath_date)}")
            validated = LawyerSchema.from_orm(l)
            print(f"Validated: {validated.first_name}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test()
