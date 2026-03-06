import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.db.models import *
import seed

# The Neon URL
NEON_URL = "postgresql://neondb_owner:npg_aBsnKWHuIJ46@ep-proud-voice-ag4bnj7d-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
engine = create_engine(NEON_URL)

print("Dropping all tables in Neon DB...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables in Neon DB...")
Base.metadata.create_all(bind=engine)

print("Running seed_db() against Neon DB...")

SessionNeon = sessionmaker(bind=engine)
db = SessionNeon()

# Call the actual seed
seed.seed_db(custom_db=db)
print("Done!")
