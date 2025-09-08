from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, Boolean
from datetime import datetime
from .db import Base
import hashlib
import secrets

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    profile_data = Column(JSON, nullable=True)  # For storing additional user preferences
    
    def set_password(self, password: str):
        """Hash and set the user's password"""
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        self.hashed_password = f"{salt}:{pwd_hash.hex()}"
    
    def check_password(self, password: str) -> bool:
        """Check if the provided password matches the user's password"""
        if not self.hashed_password or ':' not in self.hashed_password:
            return False
        
        salt, stored_hash = self.hashed_password.split(':')
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return pwd_hash.hex() == stored_hash

class ScanResult(Base):
    __tablename__ = "scan_results"
    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, index=True)
    ports = Column(String)  # JSON string of ports
    result = Column(JSON)   # Scan results
    timestamp = Column(DateTime, default=datetime.utcnow)
    scan_type = Column(String, default="full_scan")  # full_scan, quick_scan, etc.
    status = Column(String, default="completed")  # completed, failed, in_progress

class Suggestion(Base):
    __tablename__ = "suggestions"
    id = Column(Integer, primary_key=True, index=True)
    vulnerability_type = Column(String, index=True)  # RTSP, FTP, Telnet, etc.
    suggestion_text = Column(Text)
    severity = Column(String)  # Critical, High, Medium, Low
    created_at = Column(DateTime, default=datetime.utcnow)

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, index=True)
    port = Column(Integer)
    vulnerability_type = Column(String)
    description = Column(Text)
    severity = Column(String)  # Critical, High, Medium, Low
    status = Column(String, default="open")  # open, fixed, ignored
    detected_at = Column(DateTime, default=datetime.utcnow)
    fixed_at = Column(DateTime, nullable=True)
