from pydantic import BaseModel, EmailStr
from typing import Optional

# ================= User Models =================
class User(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ================= Note Models =================
class NoteCreate(BaseModel):
    title: str
    content: str

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    title: str
    content: str
    user_id: str

    class Config:
        from_attributes = True   # ✅ Pydantic v2 fix
