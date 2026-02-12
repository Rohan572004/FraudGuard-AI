from fastapi import FastAPI
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
# Cleaned up imports to avoid redundancy
from app.api.v1 import auth, fraud_detection

# Initialize the FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Define the origins that are allowed to talk to your backend
origins = [
    "http://localhost:3000",    # React's default port
    "http://127.0.0.1:3000",
]

# Add the Middleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER REGISTRATION ---

# 1. Authentication Router (Register & Login)
app.include_router(
    auth.router, 
    prefix=f"{settings.API_V1_STR}/auth", 
    tags=["Authentication"]
)

# 2. Fraud Detection Router (Predictions & History)
app.include_router(
    fraud_detection.router,
    prefix=settings.API_V1_STR,
    tags=["Fraud Detection"]
)

# Simple Health Check Route
@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}", "status": "online"}