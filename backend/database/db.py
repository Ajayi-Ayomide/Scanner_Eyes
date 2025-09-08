from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration - MySQL for production, SQLite for development
DATABASE_TYPE = os.getenv("DATABASE_TYPE", "sqlite")  # "mysql", "postgresql", or "sqlite"

if DATABASE_TYPE == "mysql":
    # MySQL configuration
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "scanner_eyes")
    
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine = create_engine(DATABASE_URL)
elif DATABASE_TYPE == "postgresql":
    # PostgreSQL configuration
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "iot_scanner")
    
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine = create_engine(DATABASE_URL)
else:
    # SQLite configuration (for development)
    DATABASE_URL = "sqlite:///./scanner.db"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
