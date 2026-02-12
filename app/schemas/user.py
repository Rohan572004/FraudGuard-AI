from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr # This will automatically reject "invalid-email" or "test@.com"
    password: str