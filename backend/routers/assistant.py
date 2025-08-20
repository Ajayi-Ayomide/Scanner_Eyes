from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas, db
from typing import List
import random

router = APIRouter()

# Dependency to get DB session
def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# AI-like response templates
AI_RESPONSES = {
    "weak_password": {
        "suggestion": "I've detected a weak password vulnerability. This is a critical security issue that needs immediate attention.",
        "steps": [
            "1. Change the default password immediately",
            "2. Use a strong password with at least 12 characters",
            "3. Include uppercase, lowercase, numbers, and special characters",
            "4. Avoid common words or patterns",
            "5. Consider using a password manager"
        ],
        "priority": "Critical"
    },
    "open_port": {
        "suggestion": "I found an open port that could be a security risk. Let's secure this immediately.",
        "steps": [
            "1. Identify if the port is necessary for device operation",
            "2. Close unnecessary ports using firewall rules",
            "3. Restrict port access to specific IP addresses",
            "4. Monitor port access logs regularly",
            "5. Consider using a VPN for remote access"
        ],
        "priority": "High"
    },
    "default_credentials": {
        "suggestion": "Default credentials detected! This is one of the most common attack vectors for IoT devices.",
        "steps": [
            "1. Change default username and password immediately",
            "2. Use unique credentials for each device",
            "3. Enable two-factor authentication if available",
            "4. Document credentials securely",
            "5. Regularly rotate passwords"
        ],
        "priority": "Critical"
    },
    "firmware": {
        "suggestion": "Your device firmware appears to be outdated. This could expose you to known vulnerabilities.",
        "steps": [
            "1. Check manufacturer's website for latest firmware",
            "2. Download firmware from official sources only",
            "3. Backup current configuration before updating",
            "4. Test firmware update in safe environment",
            "5. Schedule regular firmware update checks"
        ],
        "priority": "High"
    },
    "general": {
        "suggestion": "I can help you improve your IoT device security. Let me provide some general recommendations.",
        "steps": [
            "1. Perform regular security audits",
            "2. Keep all devices updated",
            "3. Use strong, unique passwords",
            "4. Enable security features like encryption",
            "5. Monitor network traffic for anomalies"
        ],
        "priority": "Medium"
    }
}

@router.post("/", response_model=schemas.AssistantResponse)
def ai_fix_assistant(request: schemas.AssistantRequest, db: Session = Depends(get_db)):
    """AI assistant for fixing vulnerabilities"""
    
    issue_lower = request.issue.lower()
    
    # Determine the type of issue
    if any(word in issue_lower for word in ["password", "credential", "login"]):
        response_type = "weak_password"
    elif any(word in issue_lower for word in ["port", "open", "exposed"]):
        response_type = "open_port"
    elif any(word in issue_lower for word in ["default", "factory"]):
        response_type = "default_credentials"
    elif any(word in issue_lower for word in ["firmware", "update", "version"]):
        response_type = "firmware"
    else:
        response_type = "general"
    
    response = AI_RESPONSES[response_type]
    
    # Store the interaction in database (optional)
    # You could add a new model for assistant interactions if needed
    
    return schemas.AssistantResponse(
        suggestion=response["suggestion"],
        steps=response["steps"],
        priority=response["priority"]
    )

@router.get("/quick-fixes")
def get_quick_fixes(db: Session = Depends(get_db)):
    """Get quick fix suggestions for common issues"""
    quick_fixes = [
        {
            "title": "Weak Password Detected",
            "description": "Change default password immediately",
            "priority": "Critical",
            "icon": "🔐",
            "category": "weak_password"
        },
        {
            "title": "Open Port Found",
            "description": "Close unnecessary open ports",
            "priority": "High", 
            "icon": "🚪",
            "category": "open_port"
        },
        {
            "title": "Default Credentials",
            "description": "Change factory default settings",
            "priority": "Critical",
            "icon": "⚠️",
            "category": "default_credentials"
        },
        {
            "title": "Outdated Firmware",
            "description": "Update device firmware",
            "priority": "High",
            "icon": "📱",
            "category": "firmware"
        }
    ]
    
    return {"quick_fixes": quick_fixes}
