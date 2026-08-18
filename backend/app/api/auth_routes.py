from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user_schema import UserCreate, UserLogin, UserOut, Token
from app.services.auth_service import register_user, login_user

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    return register_user(db, user_data)


@router.post("/login", response_model=Token)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    return login_user(db, user_data)