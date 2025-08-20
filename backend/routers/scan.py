from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import socket
import json
import ipaddress
from datetime import datetime
from typing import List
import subprocess
import platform

from database import models, schemas, db

router = APIRouter()

# Dependency to get DB session
def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except:
        return "192.168.1.1"  # fallback

def get_network_range(local_ip):
    """Get the network range based on local IP"""
    try:
        ip = ipaddress.IPv4Address(local_ip)
        network = ipaddress.IPv4Network(f"{ip}/24", strict=False)
        return [str(ip) for ip in network.hosts()]
    except:
        # Fallback to common local network ranges
        return [f"192.168.1.{i}" for i in range(1, 255)]

def scan_single_ip(ip, ports):
    """Scan a single IP address for open ports"""
    results = []
    for port in ports:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(1)
                result = sock.connect_ex((ip, port))
                status = "open" if result == 0 else "closed"
        except Exception as e:
            status = f"error: {str(e)}"
        
        results.append({"port": port, "status": status})
    
    return results

@router.post("/", response_model=schemas.ScanResponse)
def perform_scan(request: schemas.ScanRequest, db: Session = Depends(get_db)):
    try:
        # If specific IP provided, scan only that IP
        if request.ip and request.ip != "auto":
            ips_to_scan = [request.ip]
        else:
            # Auto-detect network and scan all IPs
            local_ip = get_local_ip()
            ips_to_scan = get_network_range(local_ip)
        
        all_results = []
        
        for ip in ips_to_scan:
            try:
                results = scan_single_ip(ip, request.ports)
                
                # Only save if we found open ports or if it's a specific IP scan
                if any(r["status"] == "open" for r in results) or request.ip != "auto":
                    scan_record = models.ScanResult(
                        ip=ip,
                        ports=json.dumps(request.ports),
                        result=results,
                        timestamp=datetime.utcnow(),
                        scan_type="full_scan" if request.ip == "auto" else "single_scan",
                        status="completed"
                    )
                    db.add(scan_record)
                    all_results.extend([{"ip": ip, "port": r["port"], "status": r["status"]} for r in results])
                
            except Exception as e:
                print(f"Error scanning {ip}: {e}")
                continue
        
        db.commit()
        
        return {
            "message": f"Scan completed successfully. Scanned {len(ips_to_scan)} IP addresses.",
            "devices": all_results,
            "scan_id": len(all_results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@router.post("/auto")
def perform_auto_scan(db: Session = Depends(get_db)):
    """Perform automatic network scan for IP cameras"""
    try:
        local_ip = get_local_ip()
        network_ips = get_network_range(local_ip)
        
        # Common ports for IP cameras
        camera_ports = [80, 443, 554, 21, 22, 23, 8080, 8000, 37777, 37778, 37779]
        
        discovered_cameras = []
        
        for ip in network_ips:
            try:
                results = scan_single_ip(ip, camera_ports)
                open_ports = [r for r in results if r["status"] == "open"]
                
                if open_ports:
                    # This might be an IP camera
                    scan_record = models.ScanResult(
                        ip=ip,
                        ports=json.dumps(camera_ports),
                        result=results,
                        timestamp=datetime.utcnow(),
                        scan_type="auto_scan",
                        status="completed"
                    )
                    db.add(scan_record)
                    
                    discovered_cameras.append({
                        "ip": ip,
                        "open_ports": open_ports,
                        "device_type": "IP Camera" if 554 in [p["port"] for p in open_ports] else "Network Device"
                    })
                    
            except Exception as e:
                continue
        
        db.commit()
        
        return {
            "message": f"Auto scan completed. Found {len(discovered_cameras)} potential IP cameras.",
            "cameras": discovered_cameras
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto scan failed: {str(e)}")

@router.get("/history", response_model=List[schemas.ScanResultOut])
def get_scan_history(db: Session = Depends(get_db)):
    history = db.query(models.ScanResult).order_by(models.ScanResult.timestamp.desc()).all()
    return history

@router.get("/stats")
def get_scan_stats(db: Session = Depends(get_db)):
    """Get scanning statistics for dashboard"""
    total_scans = db.query(models.ScanResult).count()
    recent_scans = db.query(models.ScanResult).filter(
        models.ScanResult.timestamp >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    ).count()
    
    # Count devices with vulnerabilities
    vulnerable_devices = db.query(models.ScanResult).filter(
        models.ScanResult.result.contains([{"status": "open"}])
    ).count()
    
    return {
        "total_scans": total_scans,
        "today_scans": recent_scans,
        "vulnerable_devices": vulnerable_devices,
        "last_scan": db.query(models.ScanResult).order_by(models.ScanResult.timestamp.desc()).first().timestamp if total_scans > 0 else None
    }
