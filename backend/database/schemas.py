from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

# Scan Result Schemas
class ScanResultBase(BaseModel):
    ip: str
    ports: str
    result: List[Dict[str, str]]
    scan_type: Optional[str] = "full_scan"
    status: Optional[str] = "completed"

class ScanResultCreate(ScanResultBase):
    pass

class ScanResultOut(ScanResultBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# Suggestion Schemas
class SuggestionBase(BaseModel):
    vulnerability_type: str
    suggestion_text: str
    severity: str

class SuggestionCreate(SuggestionBase):
    pass

class SuggestionOut(SuggestionBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Vulnerability Schemas
class VulnerabilityBase(BaseModel):
    ip: str
    port: int
    vulnerability_type: str
    description: str
    severity: str
    status: Optional[str] = "open"

class VulnerabilityCreate(VulnerabilityBase):
    pass

class VulnerabilityOut(VulnerabilityBase):
    id: int
    detected_at: datetime
    fixed_at: Optional[datetime]

    class Config:
        orm_mode = True

# API Request/Response Schemas
class ScanRequest(BaseModel):
    ip: str
    ports: List[int] = [80, 443, 554, 21, 22, 23, 8080, 8000]  # Default ports for IP cameras

class ScanResponse(BaseModel):
    message: str
    devices: List[Dict[str, str]]
    scan_id: int

class SuggestionRequest(BaseModel):
    keyword: str

class SuggestionResponse(BaseModel):
    keyword: str
    suggestions: List[str]

class AssistantRequest(BaseModel):
    issue: str
    device_ip: Optional[str] = None
    vulnerability_type: Optional[str] = None

class AssistantResponse(BaseModel):
    suggestion: str
    steps: List[str]
    priority: str
