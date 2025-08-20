from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, Boolean
from datetime import datetime
from .db import Base

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
