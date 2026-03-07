from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class CompanyBase(BaseModel):
    name: str

class Company(CompanyBase):
    id: int
    
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    company_id: int

class User(UserBase):
    id: int
    
    class Config:
        orm_mode = True

class ReviewBase(BaseModel):
    reactivity_score: int
    technical_expertise_score: int
    negotiation_score: int
    fee_respect_score: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    mission_id: int

class LawyerReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    mission_id: int
    company_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode=True

class LawyerBase(BaseModel):
    first_name: str
    last_name: str
    bar_association: str
    city: str
    firm_type: str
    oath_date: date
    specialties: List[str]
    in_network: bool
    average_hourly_rate: float
    law_firm_id: Optional[int] = None
    status: str = "pending"

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
    
    class Config:
        orm_mode = True

class LawyerSearchResponse(Lawyer):
    matching_score: float

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
    
    class Config:
        orm_mode = True

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
    
    class Config:
        orm_mode = True

class AuditLogBase(BaseModel):
    action: str
    target_resource: Optional[str] = None

class AuditLog(AuditLogBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
