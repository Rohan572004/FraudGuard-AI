from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TransactionCreate(BaseModel):
    distance_from_home: float
    distance_from_last_transaction: float
    ratio_to_median_purchase_price: float
    repeat_retailer: bool
    used_chip: bool
    used_pin_number: bool
    online_order: bool

class TransactionResponse(TransactionCreate):
    id: int
    is_fraud: bool
    confidence_score: float
    reasons: List[str] = [] # The new field
    created_at: datetime

    class Config:
        orm_mode = True