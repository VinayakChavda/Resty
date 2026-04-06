from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..repositories.auth_repository import AuthRepository
from ..services.auth_service import AuthService
from ..auth.schemas import UserSignup, UserLogin, Token

router = APIRouter(prefix='/auth', tags=['Authentication'])

@router.post('/signup', response_model=Token)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    repo = AuthRepository(db)
    service = AuthService(repo)
    try:
        return service.signup(user_data.email, user_data.password, user_data.full_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post('/login', response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    repo = AuthRepository(db)
    service = AuthService(repo)
    try:
        return service.login(user_data.email, user_data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))