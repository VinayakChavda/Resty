from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth.utils import get_current_user
from ..repositories.table_repository import TableRepository

router = APIRouter(prefix="/tables", tags=["Tables"])

@router.post("/")
def add_table(table_number: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = TableRepository(db)
    return repo.create(table_number, user['restaurant_id'])

@router.get("/")
def get_tables(db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = TableRepository(db)
    return repo.get_by_restaurant(user['restaurant_id'])

@router.delete("/{table_id}")
def delete_table(table_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = TableRepository(db)
    if not repo.delete(table_id, user['restaurant_id']):
        raise HTTPException(status_code=404, detail="Table not found")
    return {"message": "Table deleted"}