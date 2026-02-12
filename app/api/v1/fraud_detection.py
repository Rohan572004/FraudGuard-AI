from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import joblib
import pandas as pd
import numpy as np
import os

from app.db.session import get_db
from app.models.fraud import TransactionRecord
from app.schemas.transaction import TransactionCreate, TransactionResponse
# --- NEW AUTH IMPORTS ---
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

MODEL_PATH = os.path.join("app", "ml_models", "fraud_model.joblib")

ML_COLUMNS = [
    "distance_from_home", "distance_from_last_transaction", 
    "ratio_to_median_purchase_price", "repeat_retailer", 
    "used_chip", "used_pin_number", "online_order"
]

FRIENDLY_NAMES = {
    "distance_from_home": "Home Distance",
    "distance_from_last_transaction": "Last Trans Distance",
    "ratio_to_median_purchase_price": "Price Ratio",
    "repeat_retailer": "Repeat Retailer",
    "used_chip": "Used Chip",
    "used_pin_number": "Used PIN",
    "online_order": "Online Order"
}

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("--- SUCCESS: ML Model Loaded ---")
    else:
        model = None
except Exception as e:
    model = None

@router.post("/predict", response_model=TransactionResponse)
def predict_transaction(
    payload: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # PROTECTS THE ROUTE
):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    ml_input_values = [
        float(payload.distance_from_home),
        float(payload.distance_from_last_transaction),
        float(payload.ratio_to_median_purchase_price),
        1.0 if payload.repeat_retailer else 0.0,
        1.0 if payload.used_chip else 0.0,
        1.0 if payload.used_pin_number else 0.0,
        1.0 if payload.online_order else 0.0
    ]

    input_df = pd.DataFrame([ml_input_values], columns=ML_COLUMNS)
    
    try:
        is_fraud = bool(model.predict(input_df)[0])
        probabilities = model.predict_proba(input_df)[0]
        confidence = float(probabilities[1] if is_fraud else probabilities[0])
        
        if payload.online_order and payload.ratio_to_median_purchase_price > 10.0:
            if not payload.used_pin_number:
                is_fraud = True
                confidence = max(confidence, 0.98)

        global_importances = model.feature_importances_
        local_contributions = np.array(ml_input_values) * global_importances
        top_indices = local_contributions.argsort()[-2:][::-1]
        
        reasons_list = [FRIENDLY_NAMES[ML_COLUMNS[i]] for i in top_indices]
        if payload.online_order and "Online Order" not in reasons_list:
            reasons_list.append("Online Transaction Channel")
            
        reasons_str = ",".join(reasons_list[:3])

    except Exception as e:
        raise HTTPException(status_code=500, detail="ML processing failed")

    try:
        new_record = TransactionRecord(
            distance_from_home=float(payload.distance_from_home),
            distance_from_last_transaction=float(payload.distance_from_last_transaction),
            ratio_to_median_purchase_price=float(payload.ratio_to_median_purchase_price),
            repeat_retailer=payload.repeat_retailer,
            used_chip=payload.used_chip,
            used_pin_number=payload.used_pin_number,
            online_order=payload.online_order,
            is_fraud=is_fraud,
            confidence_score=confidence,
            reasons=reasons_str,
            owner_id=current_user.id # LINKS TO LOGGED IN USER
        )

        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        
        new_record.reasons = reasons_list 
        return new_record

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database save failed.")

@router.get("/history", response_model=List[TransactionResponse])
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # USER ONLY SEES THEIR DATA
):
    # Filter by current_user.id to ensure privacy
    transactions = db.query(TransactionRecord).filter(TransactionRecord.owner_id == current_user.id).all()
    for tx in transactions:
        if hasattr(tx, 'reasons') and isinstance(tx.reasons, str):
            tx.reasons = tx.reasons.split(",") if tx.reasons else []
        else:
            tx.reasons = []
    return transactions