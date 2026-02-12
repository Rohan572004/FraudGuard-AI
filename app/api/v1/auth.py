import re
import dns.resolver
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

def is_email_legit(email: str):
    """
    Checks if the email has a valid format and a real domain.
    """
    # 1. Basic Regex Format Check
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return False, "Invalid email format"

    # 2. Domain MX Record Check (Ensures domain can receive mail)
    try:
        domain = email.split('@')[1]
        # Look for Mail Exchange records
        dns.resolver.resolve(domain, 'MX')
        return True, ""
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, Exception):
        return False, "Email domain does not exist or cannot receive emails"

def validate_password_strength(password: str):
    """Backend check for password complexity requirements."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit"
    if not re.search(r"[!@#$%^&*]", password):
        return False, "Password must contain at least one special character (!@#$%^&*)"
    return True, ""

@router.post("/register")
def register(user_in: dict, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    if db.query(User).filter(User.email == user_in["email"]).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # 2. Validate Email Legitimacy
    is_legit_mail, mail_error = is_email_legit(user_in["email"])
    if not is_legit_mail:
        raise HTTPException(status_code=400, detail=mail_error)

    # 3. Validate password strength
    is_valid_pw, pw_error = validate_password_strength(user_in["password"])
    if not is_valid_pw:
        raise HTTPException(status_code=400, detail=pw_error)
    
    # 4. Create user
    new_user = User(
        username=user_in["username"],
        email=user_in["email"],
        hashed_password=get_password_hash(user_in["password"])
    )
    db.add(new_user)
    db.commit()
    return {"msg": "User created successfully"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}