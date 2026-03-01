from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

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
    created_at: datetime
    
    class Config:
        orm_mode = True

class LawyerBase(BaseModel):
    first_name: str
    last_name: str
    bar_association: str
    oath_date: date
    specialties: List[str]
    in_network: bool
    average_hourly_rate: float
    law_firm_id: Optional[int] = None

class LawyerCreate(LawyerBase):
    pass

class Lawyer(LawyerBase):
    id: int
    
    class Config:
        orm_mode = True

class LawyerSearchResponse(Lawyer):
    matching_score: float
