from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# ------------------------------
# Data Models
# ------------------------------
class PortScanResult(BaseModel):
    ip_address: str
    open_ports: List[int]

class VulnerabilityReport(BaseModel):
    ip_address: str
    risk_level: str
    issues: List[str]
    suggestions: List[str]

# ------------------------------
# Risk Assessment Logic
# ------------------------------
def assess_risk(open_ports: List[int]) -> (str, List[str], List[str]):
    issues = []
    suggestions = []

    # Known risky ports
    risky_ports = {
        21: "FTP port is open, which is insecure if not protected.",
        23: "Telnet is open and unencrypted.",
        554: "RTSP stream might be exposed.",
        80: "HTTP open - use HTTPS instead.",
        8080: "Commonly used for unsecured admin portals.",
        445: "SMB port open - target for ransomware.",
        22: "SSH open - secure with strong credentials."
    }

    risk_score = 0

    for port in open_ports:
        if port in risky_ports:
            issues.append(risky_ports[port])
            risk_score += 2
        else:
            risk_score += 1  # Unknown ports count as small risk

    # Determine risk level
    if risk_score >= 8:
        risk_level = "High"
    elif risk_score >= 4:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Suggestions
    if risk_level == "High":
        suggestions.append("Disable unused ports immediately.")
        suggestions.append("Update firmware and enforce authentication.")
    elif risk_level == "Medium":
        suggestions.append("Use firewall rules to limit access.")
        suggestions.append("Verify firmware and monitor device traffic.")
    else:
        suggestions.append("Device appears safe, but continue regular scans.")

    return risk_level, issues, suggestions

# ------------------------------
# API Endpoint
# ------------------------------
@router.post("/", response_model=VulnerabilityReport)
def analyze_device(scan: PortScanResult):
    if not scan.open_ports:
        raise HTTPException(status_code=400, detail="No open ports provided.")

    risk_level, issues, suggestions = assess_risk(scan.open_ports)

    return VulnerabilityReport(
        ip_address=scan.ip_address,
        risk_level=risk_level,
        issues=issues,
        suggestions=suggestions
    )
