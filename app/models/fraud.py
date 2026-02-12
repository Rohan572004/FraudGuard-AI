from sqlalchemy import Column, Integer, Float, Boolean, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class TransactionRecord(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    distance_from_home = Column(Float)
    distance_from_last_transaction = Column(Float)
    ratio_to_median_purchase_price = Column(Float)
    repeat_retailer = Column(Boolean)
    used_chip = Column(Boolean)
    used_pin_number = Column(Boolean)
    online_order = Column(Boolean)
    
    # ML Results
    is_fraud = Column(Boolean)
    confidence_score = Column(Float)
    reasons = Column(String, nullable=True) 
    
    # Audit Field
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- AUTHENTICATION LINK ---
    # This links the transaction to a specific user ID
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # This allows us to access user data from the transaction object
    owner = relationship("User", back_populates="transactions")