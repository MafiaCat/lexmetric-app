from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime

class CompanyBase(BaseModel):
    name: str

class Company(CompanyBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    company_id: int

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ReviewBase(BaseModel):
    reactivity_score: int
    technical_expertise_score: int
    negotiation_score: int
    fee_respect_score: int
    comment: Optional[str] = None
    # New factual fields
    actual_fees_paid: Optional[float] = None
    fee_billing_type: Optional[str] = None  # "forfait" | "heure" | "success_fee"
    mission_type: Optional[str] = None       # "conseil" | "contentieux" | "negociation" | "autre"
    mission_outcome: Optional[str] = None    # "gagné" | "perdu" | "accord_amiable" | "en_cours" | "abandon"
    mission_duration_days: Optional[int] = None
    would_recommend: Optional[bool] = None

class ReviewCreate(ReviewBase):
    mission_id: int

class LawyerReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    mission_id: int
    company_id: Optional[int] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LawyerStats(BaseModel):
    review_count: int
    avg_reactivity: Optional[float] = None
    avg_technical: Optional[float] = None
    avg_negotiation: Optional[float] = None
    avg_fee_respect: Optional[float] = None
    recommend_rate: Optional[float] = None       # Percentage (0–100)
    median_fees_paid: Optional[float] = None
    avg_mission_duration_days: Optional[float] = None
    mission_outcome_distribution: dict = {}
    mission_type_distribution: dict = {}
    fee_billing_type_distribution: dict = {}


class LawyerBase(BaseModel):
    first_name: str
    last_name: str
    bar_association: str
    city: str
    firm_type: str
    oath_date: Optional[date] = None
    specialties: List[str]
    in_network: bool
    average_hourly_rate: float
    law_firm_id: Optional[int] = None
    status: str = "pending"
    source: str = "manual_entry"
    is_verified: bool = False

class LawyerCreate(LawyerBase):
    pass

class LawyerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bar_association: Optional[str] = None
    city: Optional[str] = None
    firm_type: Optional[str] = None
    oath_date: Optional[date] = None
    specialties: Optional[List[str]] = None
    in_network: Optional[bool] = None
    average_hourly_rate: Optional[float] = None
    status: Optional[str] = None

class Lawyer(LawyerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class LawyerSearchResponse(Lawyer):
    matching_score: float

class LawyerPaginatedResponse(BaseModel):
    items: List[Lawyer]
    total: int
    page: int
    size: int
    pages: int

class LawyerStatusUpdate(BaseModel):
    status: str

class SupportTicketBase(BaseModel):
    ticket_type: str
    subject: str
    description: str
    priority: str = "medium"

class SupportTicketCreate(SupportTicketBase):
    pass

class SupportTicket(SupportTicketBase):
    id: int
    user_id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SupportTicketStatusUpdate(BaseModel):
    status: str

class TicketMessageBase(BaseModel):
    content: str

class TicketMessageCreate(TicketMessageBase):
    pass

class TicketMessage(TicketMessageBase):
    id: int
    ticket_id: int
    sender_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditLogBase(BaseModel):
    action: str
    target_resource: Optional[str] = None

class AuditLog(AuditLogBase):
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LawFirmBase(BaseModel):
    name: str
    size: Optional[int] = None

class LawFirmCreate(LawFirmBase):
    pass

class LawFirm(LawFirmBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class LawFirmPaginatedResponse(BaseModel):
    items: List[LawFirm]
    total: int
    page: int
    size: int
    pages: int

