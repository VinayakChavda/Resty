from sqlalchemy.orm import Session
from ..models.restaurant_user import RestaurantUser
from ..auth.utils import get_password_hash, verify_password
from .base import BaseRepository

class AuthRepository(BaseRepository):
    def create_user(self, email: str, password: str, full_name: str = None):
        hashed_password = get_password_hash(password)
        db_user = RestaurantUser(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            restaurant_id=1
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_email(self, email: str):
        return self.db.query(RestaurantUser).filter(RestaurantUser.email == email).first()

    def authenticate_user(self, email: str, password: str):
        user = self.get_user_by_email(email)
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user
