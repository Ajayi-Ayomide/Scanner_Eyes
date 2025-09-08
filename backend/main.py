import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routers import scan, suggestions, vulnerabilities, assistant, analytics, auth
from routers import device
from routers import net
from database.init_db import init_database

app = FastAPI(title="IoT Security Scanner API")

# Initialize database
init_database()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(device.router, prefix="/device", tags=["Device"])
app.include_router(scan.router, prefix="/scan", tags=["Scan"])
app.include_router(net.router, prefix="/net", tags=["Network"])
app.include_router(suggestions.router, prefix="/suggestions", tags=["Suggestions"])
app.include_router(vulnerabilities.router, prefix="/vulnerabilities")
app.include_router(assistant.router, prefix="/assistant")
app.include_router(analytics.router, prefix="/analytics")

@app.get("/")
def read_root():
    return {"message": "Welcome to IoT Security Scanner Backend", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "IoT Security Scanner"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
