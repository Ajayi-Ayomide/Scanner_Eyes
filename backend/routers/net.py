from fastapi import APIRouter
from pydantic import BaseModel
import subprocess

router = APIRouter()

class PortRule(BaseModel):
    port: int
    action: str  # "open" or "close"
    proto: str = "tcp"

def run(cmd):
    p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return p.returncode, p.stdout.strip(), p.stderr.strip()

@router.post("/port")
def port_control(rule: PortRule):
    port = int(rule.port)
    proto = "tcp" if rule.proto.lower() == "tcp" else "udp"
    if rule.action == "open":
        cmd = f"sudo iptables -I INPUT -p {proto} --dport {port} -j ACCEPT"
    elif rule.action == "close":
        cmd = f"sudo iptables -I INPUT -p {proto} --dport {port} -j DROP"
    else:
        return {"ok": False, "message": "action must be open|close"}

    code, out, err = run(cmd)
    if code != 0:
        return {"ok": False, "cmd": cmd, "error": err or out}
    # Persist rules if you like (raspi use iptables-persistent)
    return {"ok": True, "applied": {"action": rule.action, "port": port, "proto": proto}}
