from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ScanRequest(BaseModel):
    ip: Optional[str] = Field(None, description="IP address to scan (use 'auto' for network discovery)")
    ports: List[int] = Field(default=[80, 443, 554, 21, 22, 23, 8080, 8000], description="Ports to scan")
    scan_type: str = Field(default="full_scan", description="Type of scan: full_scan, quick_scan, camera_scan")

class PortResult(BaseModel):
    port: int
    status: str
    service: Optional[str] = None
    banner: Optional[str] = None

class DeviceInfo(BaseModel):
    ip: str
    device_name: Optional[str] = None
    device_type: str = "Unknown"
    open_ports: List[PortResult]
    risk_level: str = "Low"
    status: str = "Active"
    last_seen: datetime
    vulnerabilities: List[Dict[str, Any]] = []

class ScanResponse(BaseModel):
    message: str
    devices: List[DeviceInfo]
    scan_id: int
    total_devices: int
    scan_duration: Optional[float] = None

class ScanResultOut(BaseModel):
    id: int
    ip: str
    ports: str
    result: List[Dict[str, Any]]
    timestamp: datetime
    scan_type: str
    status: str
    
    class Config:
        from_attributes = True

class VulnerabilityInfo(BaseModel):
    type: str
    severity: str
    description: str
    port: int
    cve: Optional[str] = None
    fix_suggestion: Optional[str] = None

class ScanStats(BaseModel):
    total_scans: int
    today_scans: int
    vulnerable_devices: int
    last_scan: Optional[datetime]
    total_devices_found: int
    high_risk_devices: int
    medium_risk_devices: int
    low_risk_devices: int
