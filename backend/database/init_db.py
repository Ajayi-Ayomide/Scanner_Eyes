from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
from .db import DATABASE_URL

def init_database():
    """Initialize the database with all tables"""
    engine = create_engine(DATABASE_URL)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database()
