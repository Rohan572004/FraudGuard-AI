import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional

# Load the .env file
load_dotenv()

# Configuration - Now pulled from the environment
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-for-development") 
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Checks if the typed password matches the hashed one in DB"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Transforms a plain password into a secure hash"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Generates a secure JWT token for the user"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)