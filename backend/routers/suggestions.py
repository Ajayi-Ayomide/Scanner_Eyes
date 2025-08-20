from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import models, schemas, db

router = APIRouter()

# Dependency to get DB session
def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# ------------------------------
# Mock Suggestion Database
# ------------------------------
SUGGESTION_DB = {
    "RTSP": [
        "Disable RTSP if not in use.",
        "Use authentication on RTSP streams.",
        "Change default RTSP ports.",
        "Use RTSP over HTTPS when possible.",
        "Implement IP whitelisting for RTSP access."
    ],
    "FTP": [
        "Replace FTP with SFTP or FTPS.",
        "Use strong credentials and limit access to internal networks.",
        "Disable anonymous FTP access.",
        "Use firewall rules to restrict FTP access.",
        "Regularly audit FTP access logs."
    ],
    "TELNET": [
        "Avoid using Telnet. Prefer SSH.",
        "Disable Telnet on all IoT devices.",
        "Use encrypted protocols for remote access.",
        "Implement key-based authentication.",
        "Monitor for unauthorized Telnet attempts."
    ],
    "DEFAULT_CREDENTIALS": [
        "Change default login credentials immediately.",
        "Use strong, unique passwords for each device.",
        "Implement password rotation policies.",
        "Use password managers for credential storage.",
        "Enable two-factor authentication where possible."
    ],
    "UNPATCHED_FIRMWARE": [
        "Regularly check for firmware updates.",
        "Subscribe to vendor security notifications.",
        "Test firmware updates in a safe environment.",
        "Maintain a firmware update schedule.",
        "Keep backup configurations before updates."
    ],
    "OPEN_PORTS": [
        "Close unnecessary open ports.",
        "Use firewall rules to restrict port access.",
        "Implement port scanning detection.",
        "Monitor port access logs regularly.",
        "Use VPN for remote access instead of open ports."
    ],
    "WEAK_PASSWORDS": [
        "Use strong passwords with mixed characters.",
        "Implement password complexity requirements.",
        "Use password managers for secure storage.",
        "Enable account lockout after failed attempts.",
        "Regularly audit password policies."
    ]
}

# ------------------------------
# Models
# ------------------------------
class SuggestionResponse(BaseModel):
    keyword: str
    suggestions: List[str]
    severity: str

# ------------------------------
# API Endpoint
# ------------------------------
@router.post("/", response_model=SuggestionResponse)
def get_suggestions(request: schemas.SuggestionRequest, db: Session = Depends(get_db)):
    keyword_upper = request.keyword.strip().upper()
    
    # Map keywords to suggestion categories
    keyword_mapping = {
        "RTSP": "RTSP",
        "FTP": "FTP", 
        "TELNET": "TELNET",
        "SSH": "TELNET",  # SSH suggestions for secure alternatives
        "DEFAULT": "DEFAULT_CREDENTIALS",
        "PASSWORD": "WEAK_PASSWORDS",
        "CREDENTIALS": "DEFAULT_CREDENTIALS",
        "FIRMWARE": "UNPATCHED_FIRMWARE",
        "UPDATE": "UNPATCHED_FIRMWARE",
        "PORT": "OPEN_PORTS",
        "OPEN": "OPEN_PORTS"
    }
    
    # Find matching category
    matched_category = None
    for key, category in keyword_mapping.items():
        if key in keyword_upper:
            matched_category = category
            break
    
    if matched_category and matched_category in SUGGESTION_DB:
        suggestions = SUGGESTION_DB[matched_category]
        severity = "Critical" if matched_category in ["TELNET", "DEFAULT_CREDENTIALS"] else "High"
    else:
        # Default suggestions for unknown keywords
        suggestions = [
            "Perform a comprehensive security audit.",
            "Update all device firmware to latest versions.",
            "Change default passwords on all devices.",
            "Enable firewall rules and access controls.",
            "Implement network segmentation for IoT devices."
        ]
        severity = "Medium"
        matched_category = "GENERAL"
    
    # Store suggestion request in database
    for suggestion in suggestions:
        suggestion_record = models.Suggestion(
            vulnerability_type=matched_category,
            suggestion_text=suggestion,
            severity=severity
        )
        db.add(suggestion_record)
    
    db.commit()
    
    return SuggestionResponse(
        keyword=matched_category,
        suggestions=suggestions,
        severity=severity
    )

@router.get("/history")
def get_suggestion_history(db: Session = Depends(get_db)):
    """Get suggestion history from database"""
    suggestions = db.query(models.Suggestion).order_by(models.Suggestion.created_at.desc()).limit(50).all()
    return suggestions
