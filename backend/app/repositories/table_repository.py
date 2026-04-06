from sqlalchemy.orm import Session
from ..models.table import Table
from .base import BaseRepository

class TableRepository(BaseRepository):
    def create(self, table_number: str, restaurant_id: int):
        db_table = Table(table_number=table_number, restaurant_id=restaurant_id)
        self.db.add(db_table)
        self.db.commit()
        self.db.refresh(db_table)
        return db_table

    def get_by_restaurant(self, restaurant_id: int):
        return self.db.query(Table).filter(Table.restaurant_id == restaurant_id).all()

    def delete(self, table_id: int, restaurant_id: int):
        db_table = self.db.query(Table).filter(Table.id == table_id, Table.restaurant_id == restaurant_id).first()
        if db_table:
            self.db.delete(db_table)
            self.db.commit()
            return True
        return False