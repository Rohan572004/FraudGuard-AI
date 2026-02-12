from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# pool_pre_ping=True checks the connection before using it (very stable)
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# SessionLocal is what we use to create a 'conversation' with the DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models (fraud.py will inherit from this)
class Base(DeclarativeBase):
    pass

# The 'Dependency' used in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()