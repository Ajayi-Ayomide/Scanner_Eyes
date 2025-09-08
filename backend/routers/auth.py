from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import jwt
import os
from dotenv import load_dotenv

from database.db import get_db
from database.models import User
from schemas.auth import UserCreate, UserLogin, UserResponse, Token, PasswordReset, PasswordResetConfirm

load_dotenv()

router = APIRouter()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    """Verify JWT token and return user email"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except jwt.PyJWTError:
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = User(
        name=user.name,
        email=user.email,
        is_active=True,
        is_verified=False
    )
    db_user.set_password(user.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    # Find user by email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not user.check_password(user_credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    if name is not None:
        current_user.name = name
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Verify current password
    if not current_user.check_password(current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Set new password
    current_user.set_password(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """Initiate password reset process"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # In a real application, you would send an email with reset token
    # For now, we'll just return a success message
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
def reset_password(reset_data: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password with token"""
    # In a real application, you would verify the token
    # For now, we'll just return a success message
    return {"message": "Password reset successfully"}

@router.delete("/me")
def delete_account(
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account"""
    # Verify password
    if not current_user.check_password(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    
    # Deactivate account instead of deleting
    current_user.is_active = False
    db.commit()
    
    return {"message": "Account deactivated successfully"}
