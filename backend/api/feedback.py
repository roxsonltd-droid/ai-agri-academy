from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.database import get_db
from models.feedback import TutorFeedback

router = APIRouter()


class TutorFeedbackIn(BaseModel):
    helpful: bool
    comment: str | None = Field(default=None, max_length=2000)
    route: str | None = Field(default=None, max_length=128)


class TutorFeedbackOut(BaseModel):
    id: int
    ok: bool = True

    class Config:
        from_attributes = True


@router.post("/tutor", response_model=TutorFeedbackOut)
def submit_tutor_feedback(body: TutorFeedbackIn, db: Session = Depends(get_db)):
    row = TutorFeedback(helpful=body.helpful, comment=body.comment, route=body.route)
    db.add(row)
    try:
        db.commit()
        db.refresh(row)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
    return TutorFeedbackOut(id=row.id)
