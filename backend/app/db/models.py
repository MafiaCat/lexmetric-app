from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class LawFirm(Base):
    __tablename__ = "law_firms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    size = Column(Integer)
    
    lawyers = relationship("Lawyer", back_populates="firm")

class Lawyer(Base):
    __tablename__ = "lawyers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    bar_association = Column(String)
    oath_date = Column(Date)
    specialties = Column(JSON)  # ["Préjudice Corporel", "RC Décennale"]
    city = Column(String)
    firm_type = Column(String)  # e.g., "Individuel", "Cabinet Associé"
    in_network = Column(Boolean, default=False)
    average_hourly_rate = Column(Float)
    
    law_firm_id = Column(Integer, ForeignKey("law_firms.id"), nullable=True)
    firm = relationship("LawFirm", back_populates="lawyers")
    
    missions = relationship("Mission", back_populates="lawyer")

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    lawyer_id = Column(Integer, ForeignKey("lawyers.id"))
    status = Column(String, default="En cours")
    financial_stakes = Column(Float)
    
    lawyer = relationship("Lawyer", back_populates="missions")
    review = relationship("Review", back_populates="mission", uselist=False)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), unique=True)
    reactivity_score = Column(Integer) # 1-5
    technical_expertise_score = Column(Integer) # 1-5
    negotiation_score = Column(Integer) # 1-5
    fee_respect_score = Column(Integer) # 1-5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mission = relationship("Mission", back_populates="review")
