import socket
import threading
import time
import json
import ipaddress
import subprocess
import platform
from typing import List, Dict, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from datetime import datetime

class NetworkScanner:
    def __init__(self):
        self.common_ports = {
            # Web services
            80: "HTTP",
            443: "HTTPS",
            8080: "HTTP-Alt",
            8000: "HTTP-Alt",
            8443: "HTTPS-Alt",
            
            # Camera services
            554: "RTSP",
            1935: "RTMP",
            37777: "Dahua",
            37778: "Dahua-Alt",
            37779: "Dahua-Alt2",
            
            # Remote access
            22: "SSH",
            23: "Telnet",
            3389: "RDP",
            5900: "VNC",
            
            # File transfer
            21: "FTP",
            22: "SFTP",
            
            # Database
            3306: "MySQL",
            5432: "PostgreSQL",
            1433: "MSSQL",
            
            # Other common services
            25: "SMTP",
            53: "DNS",
            110: "POP3",
            143: "IMAP",
            993: "IMAPS",
            995: "POP3S",
            587: "SMTP-Sub",
            465: "SMTPS",
        }
        
        self.camera_ports = [80, 443, 554, 21, 22, 23, 8080, 8000, 37777, 37778, 37779]
        self.quick_scan_ports = [22, 23, 80, 443, 554, 8080]
        self.full_scan_ports = list(self.common_ports.keys())

    def get_local_ip(self) -> str:
        """Get the local IP address of the machine"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except:
            return "192.168.1.1"  # fallback

    def get_network_range(self, local_ip: str) -> List[str]:
        """Get the network range based on local IP"""
        try:
            ip = ipaddress.IPv4Address(local_ip)
            network = ipaddress.IPv4Network(f"{ip}/24", strict=False)
            return [str(ip) for ip in network.hosts()]
        except:
            # Fallback to common local network ranges
            return [f"192.168.1.{i}" for i in range(1, 255)]

    def scan_port(self, ip: str, port: int, timeout: float = 1.0) -> Dict[str, Any]:
        """Scan a single port on an IP address"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(timeout)
                result = sock.connect_ex((ip, port))
                
                if result == 0:
                    # Port is open, try to get banner
                    banner = self.get_banner(ip, port)
                    service = self.common_ports.get(port, "Unknown")
                    
                    return {
                        "port": port,
                        "status": "open",
                        "service": service,
                        "banner": banner
                    }
                else:
                    return {
                        "port": port,
                        "status": "closed",
                        "service": None,
                        "banner": None
                    }
        except Exception as e:
            return {
                "port": port,
                "status": f"error: {str(e)}",
                "service": None,
                "banner": None
            }

    def get_banner(self, ip: str, port: int, timeout: float = 2.0) -> Optional[str]:
        """Try to get service banner from open port"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(timeout)
                sock.connect((ip, port))
                
                # Try to receive some data
                banner = sock.recv(1024).decode('utf-8', errors='ignore').strip()
                return banner if banner else None
        except:
            return None

    def scan_ip_ports(self, ip: str, ports: List[int], max_threads: int = 50) -> List[Dict[str, Any]]:
        """Scan multiple ports on a single IP using threading"""
        results = []
        
        with ThreadPoolExecutor(max_workers=max_threads) as executor:
            future_to_port = {executor.submit(self.scan_port, ip, port): port for port in ports}
            
            for future in as_completed(future_to_port):
                result = future.result()
                results.append(result)
        
        return sorted(results, key=lambda x: x['port'])

    def identify_device_type(self, open_ports: List[Dict[str, Any]]) -> Tuple[str, str]:
        """Identify device type and risk level based on open ports"""
        port_numbers = [p['port'] for p in open_ports if p['status'] == 'open']
        
        # Device type identification
        if 554 in port_numbers:
            device_type = "IP Camera (RTSP)"
            risk_level = "High"
        elif 80 in port_numbers or 443 in port_numbers:
            if 8080 in port_numbers or 8000 in port_numbers:
                device_type = "IP Camera (Web)"
                risk_level = "High"
            else:
                device_type = "Web Server"
                risk_level = "Medium"
        elif 22 in port_numbers:
            device_type = "Linux Server"
            risk_level = "Medium"
        elif 23 in port_numbers:
            device_type = "Network Device (Telnet)"
            risk_level = "Critical"
        elif 21 in port_numbers:
            device_type = "FTP Server"
            risk_level = "High"
        elif 3389 in port_numbers:
            device_type = "Windows Server"
            risk_level = "Medium"
        else:
            device_type = "Network Device"
            risk_level = "Low"
        
        # Adjust risk level based on multiple factors
        if len(port_numbers) > 5:
            if risk_level == "Low":
                risk_level = "Medium"
            elif risk_level == "Medium":
                risk_level = "High"
        
        return device_type, risk_level

    def detect_vulnerabilities(self, ip: str, open_ports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect common vulnerabilities based on open ports and services"""
        vulnerabilities = []
        
        for port_info in open_ports:
            if port_info['status'] != 'open':
                continue
                
            port = port_info['port']
            service = port_info.get('service', '')
            banner = port_info.get('banner', '')
            
            # Check for common vulnerabilities
            if port == 23:  # Telnet
                vulnerabilities.append({
                    "type": "Telnet Service",
                    "severity": "Critical",
                    "description": "Telnet service detected - unencrypted communication",
                    "port": port,
                    "cve": None,
                    "fix_suggestion": "Disable Telnet and use SSH instead"
                })
            
            elif port == 21:  # FTP
                vulnerabilities.append({
                    "type": "FTP Service",
                    "severity": "High",
                    "description": "FTP service detected - potentially unencrypted file transfer",
                    "port": port,
                    "cve": None,
                    "fix_suggestion": "Use SFTP or FTPS for secure file transfer"
                })
            
            elif port == 80 and "camera" in banner.lower():
                vulnerabilities.append({
                    "type": "Unsecured Camera Web Interface",
                    "severity": "High",
                    "description": "Camera web interface without HTTPS",
                    "port": port,
                    "cve": None,
                    "fix_suggestion": "Enable HTTPS and change default credentials"
                })
            
            elif port == 554:  # RTSP
                vulnerabilities.append({
                    "type": "RTSP Service",
                    "severity": "Medium",
                    "description": "RTSP service detected - check for authentication",
                    "port": port,
                    "cve": None,
                    "fix_suggestion": "Ensure RTSP service requires authentication"
                })
        
        return vulnerabilities

    def scan_network(self, target_ips: List[str], ports: List[int], scan_type: str = "full_scan") -> List[Dict[str, Any]]:
        """Scan a network for devices and vulnerabilities"""
        devices = []
        start_time = time.time()
        
        print(f"Starting {scan_type} on {len(target_ips)} IPs with {len(ports)} ports each")
        
        for ip in target_ips:
            try:
                # Scan ports for this IP
                port_results = self.scan_ip_ports(ip, ports)
                open_ports = [p for p in port_results if p['status'] == 'open']
                
                if open_ports:
                    # Identify device type and risk level
                    device_type, risk_level = self.identify_device_type(open_ports)
                    
                    # Detect vulnerabilities
                    vulnerabilities = self.detect_vulnerabilities(ip, open_ports)
                    
                    # Create device info
                    device_info = {
                        "ip": ip,
                        "device_name": f"{device_type} ({ip})",
                        "device_type": device_type,
                        "open_ports": open_ports,
                        "risk_level": risk_level,
                        "status": "Active",
                        "last_seen": datetime.utcnow().isoformat(),
                        "vulnerabilities": vulnerabilities
                    }
                    
                    devices.append(device_info)
                    print(f"Found device: {ip} - {device_type} ({risk_level} risk)")
                
            except Exception as e:
                print(f"Error scanning {ip}: {e}")
                continue
        
        scan_duration = time.time() - start_time
        print(f"Scan completed in {scan_duration:.2f} seconds. Found {len(devices)} devices.")
        
        return devices

    def quick_scan(self, target_ip: str) -> Dict[str, Any]:
        """Perform a quick scan on a single IP"""
        ports = self.quick_scan_ports
        port_results = self.scan_ip_ports(target_ip, ports)
        open_ports = [p for p in port_results if p['status'] == 'open']
        
        if open_ports:
            device_type, risk_level = self.identify_device_type(open_ports)
            vulnerabilities = self.detect_vulnerabilities(target_ip, open_ports)
            
            return {
                "ip": target_ip,
                "device_name": f"{device_type} ({target_ip})",
                "device_type": device_type,
                "open_ports": open_ports,
                "risk_level": risk_level,
                "status": "Active",
                "last_seen": datetime.utcnow().isoformat(),
                "vulnerabilities": vulnerabilities
            }
        
        return None

    def camera_scan(self, target_ips: List[str]) -> List[Dict[str, Any]]:
        """Specialized scan for IP cameras"""
        return self.scan_network(target_ips, self.camera_ports, "camera_scan")

# Global scanner instance
scanner = NetworkScanner()
