from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    
    users = relationship("User", back_populates="company")
    reviews = relationship("Review", back_populates="company")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String, default="user") # "user" or "admin"
    
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="users")

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
    status = Column(String, default="pending")  # "pending", "approved", "rejected"
    
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
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True) # The company that gave the review
    reactivity_score = Column(Integer) # 1-5
    technical_expertise_score = Column(Integer) # 1-5
    negotiation_score = Column(Integer) # 1-5
    fee_respect_score = Column(Integer) # 1-5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mission = relationship("Mission", back_populates="review")
    company = relationship("Company", back_populates="reviews")

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    ticket_type = Column(String) # "profile_update", "fake_review_report", "bug_report", "feature_request", "billing_issue", "other"
    subject = Column(String)
    description = Column(String)
    status = Column(String, default="open") # "open", "in_progress", "resolved", "closed"
    priority = Column(String, default="medium") # "low", "medium", "high", "critical"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    company = relationship("Company")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("SupportTicket", back_populates="messages")
    sender = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # e.g., "IMPERSONATE_USER", "DELETE_REVIEW", "APPROVE_LAWYER", "IMPORT_LAWYERS"
    target_resource = Column(String, nullable=True) # e.g., "Review #45", "Lawyer #10"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
