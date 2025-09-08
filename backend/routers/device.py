# routers/device.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Define request model
class DeviceScanRequest(BaseModel):
    ip: str
    port: int = 554  # Default RTSP port

# Example response when scanning a device
@router.post("/scan")
def scan_device(request: DeviceScanRequest):
    """
    Simulates scanning a single device (IP camera).
    Later we’ll extend this to check RTSP, ONVIF, etc.
    """
    result = {
        "ip": request.ip,
        "port": request.port,
        "status": "open",   # Placeholder: later we’ll run a real check
        "vulnerabilities": [
            "Weak/default password possible",
            "RTSP stream not encrypted"
        ]
    }
    return result
