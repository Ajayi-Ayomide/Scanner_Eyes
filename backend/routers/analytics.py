from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from io import StringIO
from database.db import get_db
from database.models import ScanResult, Vulnerability, Suggestion
from typing import Optional
from pytz import utc

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/")
async def get_analytics(
    range: str = Query("7d", description="Time range: 7d, 30d, 90d, 1y"),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics data from the database"""
    try:
        end_date = datetime.utcnow().replace(tzinfo=utc)
        if range == "7d":
            start_date = end_date - timedelta(days=7)
        elif range == "30d":
            start_date = end_date - timedelta(days=30)
        elif range == "90d":
            start_date = end_date - timedelta(days=90)
        elif range == "1y":
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=7)

        scans = db.query(ScanResult).filter(ScanResult.timestamp >= start_date, ScanResult.timestamp <= end_date).order_by(ScanResult.timestamp.desc()).all()
        total_scans = len(scans)
        scan_history = [
            {
                "id": scan.id,
                "type": scan.scan_type,
                "status": scan.status,
                "devices_found": len(scan.result) if scan.result else 0,
                "vulnerabilities_found": 0,
                "timestamp": scan.timestamp.astimezone(utc).isoformat() if scan.timestamp else None
            }
            for scan in scans
        ]
        vulns = db.query(Vulnerability).filter(Vulnerability.detected_at >= start_date, Vulnerability.detected_at <= end_date).all()
        total_vulns = len(vulns)
        critical_vulns = sum(1 for v in vulns if v.severity == "Critical")
        high_vulns = sum(1 for v in vulns if v.severity == "High")
        medium_vulns = sum(1 for v in vulns if v.severity == "Medium")
        low_vulns = sum(1 for v in vulns if v.severity == "Low")
        fixed_vulns = sum(1 for v in vulns if v.status == "fixed")
        recent_activity = [
            {
                "id": scan.id,
                "type": "scan",
                "description": f"{scan.scan_type.capitalize()} scan completed",
                "timestamp": scan.timestamp.astimezone(utc).isoformat() if scan.timestamp else None,
                "severity": "info"
            }
            for scan in scans[:5]
        ]
        device_types = []
        trends = {}
        for v in vulns:
            day = v.detected_at.astimezone(utc).date().isoformat() if v.detected_at else None
            if not day:
                continue
            if day not in trends:
                trends[day] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
            if v.severity == "Critical":
                trends[day]["critical"] += 1
            elif v.severity == "High":
                trends[day]["high"] += 1
            elif v.severity == "Medium":
                trends[day]["medium"] += 1
            elif v.severity == "Low":
                trends[day]["low"] += 1
        vulnerability_trends = [
            {"date": day, **counts} for day, counts in sorted(trends.items())
        ]
        max_score = max(1, total_vulns + fixed_vulns)
        score = max(0, 100 - ((critical_vulns * 10 + high_vulns * 7 + medium_vulns * 4 + low_vulns * 1) / (max_score * 10) * 100))
        analytics_data = {
            "totalScans": total_scans,
            "totalVulnerabilities": total_vulns,
            "criticalVulnerabilities": critical_vulns,
            "highVulnerabilities": high_vulns,
            "mediumVulnerabilities": medium_vulns,
            "lowVulnerabilities": low_vulns,
            "fixedVulnerabilities": fixed_vulns,
            "securityScore": int(score),
            "recentActivity": recent_activity,
            "vulnerabilityTrends": vulnerability_trends,
            "deviceTypes": device_types,
            "scanHistory": scan_history
        }
        return analytics_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@router.get("/export")
async def export_analytics(
    format: str = Query("pdf", description="Export format: pdf, csv, json"),
    range: str = Query("7d", description="Time range: 7d, 30d, 90d, 1y")
):
    """Export analytics data in various formats"""
    try:
        # Get analytics data
        analytics_data = await get_analytics(range)
        
        if format == "json":
            return {
                "content": json.dumps(analytics_data, indent=2),
                "filename": f"security_report_{datetime.now().strftime('%Y%m%d')}.json",
                "content_type": "application/json"
            }
        
        elif format == "csv":
            # Create CSV content
            output = StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Total Scans", analytics_data["totalScans"]])
            writer.writerow(["Total Vulnerabilities", analytics_data["totalVulnerabilities"]])
            writer.writerow(["Critical Vulnerabilities", analytics_data["criticalVulnerabilities"]])
            writer.writerow(["High Vulnerabilities", analytics_data["highVulnerabilities"]])
            writer.writerow(["Medium Vulnerabilities", analytics_data["mediumVulnerabilities"]])
            writer.writerow(["Low Vulnerabilities", analytics_data["lowVulnerabilities"]])
            writer.writerow(["Fixed Vulnerabilities", analytics_data["fixedVulnerabilities"]])
            writer.writerow(["Security Score", analytics_data["securityScore"]])
            
            return {
                "content": output.getvalue(),
                "filename": f"security_report_{datetime.now().strftime('%Y%m%d')}.csv",
                "content_type": "text/csv"
            }
        
        elif format == "pdf":
            # For PDF, we'll return a simple text representation
            # In production, you'd use a library like reportlab or weasyprint
            pdf_content = f"""
Security Report - {datetime.now().strftime('%Y-%m-%d')}
Generated for range: {range}

SUMMARY:
- Total Scans: {analytics_data["totalScans"]}
- Total Vulnerabilities: {analytics_data["totalVulnerabilities"]}
- Critical: {analytics_data["criticalVulnerabilities"]}
- High: {analytics_data["highVulnerabilities"]}
- Medium: {analytics_data["mediumVulnerabilities"]}
- Low: {analytics_data["lowVulnerabilities"]}
- Fixed: {analytics_data["fixedVulnerabilities"]}
- Security Score: {analytics_data["securityScore"]}/100

DEVICE TYPES:
"""
            for device in analytics_data["deviceTypes"]:
                pdf_content += f"- {device['type']}: {device['count']} devices, {device['vulnerabilities']} vulnerabilities\n"
            
            return {
                "content": pdf_content,
                "filename": f"security_report_{datetime.now().strftime('%Y%m%d')}.txt",
                "content_type": "text/plain"
            }
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

@router.get("/security-score")
async def get_security_score():
    """Calculate and return the current security score"""
    try:
        # Mock calculation (replace with actual logic)
        total_vulns = 15
        critical_vulns = 3
        high_vulns = 5
        medium_vulns = 4
        low_vulns = 3
        fixed_vulns = 8
        
        # Calculate score (simplified algorithm)
        total_weight = critical_vulns * 10 + high_vulns * 7 + medium_vulns * 4 + low_vulns * 1
        max_possible = (total_vulns + fixed_vulns) * 10
        score = max(0, 100 - (total_weight / max_possible * 100))
        
        return {
            "score": int(score),
            "breakdown": {
                "critical_weight": critical_vulns * 10,
                "high_weight": high_vulns * 7,
                "medium_weight": medium_vulns * 4,
                "low_weight": low_vulns * 1,
                "fixed_count": fixed_vulns
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security score calculation error: {str(e)}")

@router.get("/trends")
async def get_vulnerability_trends(range: str = Query("7d")):
    """Get vulnerability trends over time"""
    try:
        # Mock trend data (replace with actual database queries)
        trends = [
            {"date": "2024-01-09", "critical": 2, "high": 3, "medium": 2, "low": 1},
            {"date": "2024-01-10", "critical": 3, "high": 4, "medium": 3, "low": 2},
            {"date": "2024-01-11", "critical": 3, "high": 5, "medium": 4, "low": 2},
            {"date": "2024-01-12", "critical": 2, "high": 4, "medium": 3, "low": 2},
            {"date": "2024-01-13", "critical": 3, "high": 5, "medium": 4, "low": 3},
            {"date": "2024-01-14", "critical": 3, "high": 5, "medium": 4, "low": 3},
            {"date": "2024-01-15", "critical": 3, "high": 5, "medium": 4, "low": 3}
        ]
        
        return {"trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trends error: {str(e)}")
