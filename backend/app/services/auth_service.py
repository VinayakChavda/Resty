from ..repositories.auth_repository import AuthRepository
from ..auth.utils import create_access_token

class AuthService:
    def __init__(self, repo: AuthRepository):
        self.repo = repo

    def signup(self, email: str, password: str, full_name: str = None):
        existing_user = self.repo.get_user_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user
        user = self.repo.create_user(email, password, full_name)
        
        # Generate token after successful signup
        token = create_access_token({
            "sub": user.email,
            "restaurant_id": user.restaurant_id
        })
        
        return {"access_token": token, "token_type": "bearer"}

    def login(self, email: str, password: str):
        user = self.repo.authenticate_user(email, password)
        if not user:
            raise ValueError("Invalid email or password")
        
        token = create_access_token({
            "sub": user.email,
            "restaurant_id": user.restaurant_id
        })
        return {"access_token": token, "token_type": "bearer"}