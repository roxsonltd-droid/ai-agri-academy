from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db

router = APIRouter()

@router.get("/me")
def read_user_me(db: Session = Depends(get_db)):
    # Mocking user data until auth is fully implemented
    return {
        "id": 1,
        "email": "student@agroacademy.com",
        "full_name": "Teo Test",
        "role": "student"
    }

@router.get("/")
def read_users(db: Session = Depends(get_db)):
    # Mock return list of users
    return [{"email": "student@agroacademy.com"}]
