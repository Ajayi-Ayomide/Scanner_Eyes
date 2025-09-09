from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from datetime import datetime
from typing import List
import time

from database.db import get_db
from database.models import ScanResult, Vulnerability
from schemas.scan import ScanRequest, ScanResponse, ScanResultOut, ScanStats, DeviceInfo, PortResult
from services.scanner import scanner

router = APIRouter()

@router.post("/", response_model=ScanResponse)
def perform_scan(request: ScanRequest, db: Session = Depends(get_db)):
    """Perform network scan with specified parameters"""
    try:
        start_time = time.time()
        
        # Determine target IPs
        if request.ip and request.ip != "auto":
            target_ips = [request.ip]
        else:
            # Auto-detect network
            local_ip = scanner.get_local_ip()
            target_ips = scanner.get_network_range(local_ip)
        
        # Perform scan
        devices = scanner.scan_network(target_ips, request.ports, request.scan_type)
        
        # Save scan results to database
        from datetime import timezone
        scan_record = ScanResult(
            ip=request.ip or "auto",
            ports=json.dumps(request.ports),
            result=[device for device in devices],
            timestamp=datetime.now(timezone.utc),
            scan_type=request.scan_type,
            status="completed"
        )
        db.add(scan_record)
        
        # Save vulnerabilities
        for device in devices:
            for vuln in device.get('vulnerabilities', []):
                vulnerability = Vulnerability(
                    ip=device['ip'],
                    port=vuln['port'],
                    vulnerability_type=vuln['type'],
                    description=vuln['description'],
                    severity=vuln['severity'],
                    status="open"
                )
                db.add(vulnerability)
        
        db.commit()
        
        scan_duration = time.time() - start_time
        
        return ScanResponse(
            message=f"Scan completed successfully. Found {len(devices)} devices.",
            devices=devices,
            scan_id=scan_record.id,
            total_devices=len(devices),
            scan_duration=scan_duration
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@router.post("/auto")
def perform_auto_scan(db: Session = Depends(get_db)):
    """Perform automatic network scan for IP cameras"""
    try:
        start_time = time.time()
        
        # Get network range
        local_ip = scanner.get_local_ip()
        target_ips = scanner.get_network_range(local_ip)
        
        # Perform camera-specific scan
        devices = scanner.camera_scan(target_ips)
        
        # Save scan results
        from datetime import timezone
        scan_record = ScanResult(
            ip="auto",
            ports=json.dumps(scanner.camera_ports),
            result=[device for device in devices],
            timestamp=datetime.now(timezone.utc),
            scan_type="auto_scan",
            status="completed"
        )
        db.add(scan_record)
        
        # Save vulnerabilities
        for device in devices:
            for vuln in device.get('vulnerabilities', []):
                vulnerability = Vulnerability(
                    ip=device['ip'],
                    port=vuln['port'],
                    vulnerability_type=vuln['type'],
                    description=vuln['description'],
                    severity=vuln['severity'],
                    status="open"
                )
                db.add(vulnerability)
        
        db.commit()
        
        scan_duration = time.time() - start_time
        
        return {
            "message": f"Auto scan completed. Found {len(devices)} potential IP cameras.",
            "cameras": devices,
            "scan_duration": scan_duration
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto scan failed: {str(e)}")

@router.get("/history", response_model=List[ScanResultOut])
def get_scan_history(db: Session = Depends(get_db)):
    """Get scan history"""
    history = db.query(ScanResult).order_by(ScanResult.timestamp.desc()).limit(50).all()
    return history

@router.get("/stats", response_model=ScanStats)
def get_scan_stats(db: Session = Depends(get_db)):
    """Get scanning statistics for dashboard"""
    total_scans = db.query(ScanResult).count()
    
    # Today's scans
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_scans = db.query(ScanResult).filter(ScanResult.timestamp >= today).count()
    
    # Vulnerable devices
    vulnerable_devices = db.query(Vulnerability).filter(Vulnerability.status == "open").count()
    
    # Last scan
    last_scan = db.query(ScanResult).order_by(ScanResult.timestamp.desc()).first()
    last_scan_time = last_scan.timestamp if last_scan else None
    
    # Count devices by risk level
    high_risk = db.query(ScanResult).filter(ScanResult.result.contains([{"risk_level": "High"}])).count()
    medium_risk = db.query(ScanResult).filter(ScanResult.result.contains([{"risk_level": "Medium"}])).count()
    low_risk = db.query(ScanResult).filter(ScanResult.result.contains([{"risk_level": "Low"}])).count()
    
    return ScanStats(
        total_scans=total_scans,
        today_scans=today_scans,
        vulnerable_devices=vulnerable_devices,
        last_scan=last_scan_time,
        total_devices_found=high_risk + medium_risk + low_risk,
        high_risk_devices=high_risk,
        medium_risk_devices=medium_risk,
        low_risk_devices=low_risk
    )

@router.get("/quick/{ip}")
def quick_scan_ip(ip: str, db: Session = Depends(get_db)):
    """Perform a quick scan on a specific IP"""
    try:
        device = scanner.quick_scan(ip)
        
        if device:
            # Save to database
            from datetime import timezone
            scan_record = ScanResult(
                ip=ip,
                ports=json.dumps(scanner.quick_scan_ports),
                result=[device],
                timestamp=datetime.now(timezone.utc),
                scan_type="quick_scan",
                status="completed"
            )
            db.add(scan_record)
            db.commit()
            
            return {"message": f"Quick scan completed for {ip}", "device": device}
        else:
            return {"message": f"No open ports found on {ip}", "device": None}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick scan failed: {str(e)}")
