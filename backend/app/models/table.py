from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base

class Table(Base):
    __tablename__ = 'tables'

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)
    table_number = Column(String, nullable=False) # e.g. "T1", "T2"
    
    # Isse hum track kar sakte hain ki QR kis link pe jayega