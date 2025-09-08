#!/usr/bin/env python3
"""
Database Setup Script for Scanner Eyes
This script will create the MySQL database and tables for the Scanner Eyes application.
Make sure XAMPP is running and MySQL is accessible before running this script.
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create the database if it doesn't exist"""
    # Connect to MySQL server (without specifying database)
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "scanner_eyes")
    
    # Create connection to MySQL server
    server_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}"
    
    try:
        engine = create_engine(server_url)
        
        with engine.connect() as conn:
            # Create database if it doesn't exist
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            print(f"✅ Database '{db_name}' created successfully!")
            
            # Use the database
            conn.execute(text(f"USE {db_name}"))
            print(f"✅ Connected to database '{db_name}'")
            
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure XAMPP is running")
        print("2. Check if MySQL service is started in XAMPP")
        print("3. Verify your database credentials in .env file")
        print("4. Try accessing phpMyAdmin at http://localhost/phpmyadmin")
        return False
    
    return True

def create_tables():
    """Create all tables using the existing models"""
    try:
        from database.db import engine
        from database.models import Base
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # Verify tables were created
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            print(f"📋 Created tables: {', '.join(tables)}")
            
            # Check if users table has any data
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()
            print(f"👥 Users in database: {user_count}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    return True

def main():
    print("🚀 Setting up Scanner Eyes Database...")
    print("=" * 50)
    
    # Step 1: Create database
    if not create_database():
        sys.exit(1)
    
    # Step 2: Create tables
    if not create_tables():
        sys.exit(1)
    
    print("=" * 50)
    print("🎉 Database setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the backend server: python main.py")
    print("2. Access phpMyAdmin at: http://localhost/phpmyadmin")
    print("3. Database name: scanner_eyes")
    print("4. Username: root (no password)")

if __name__ == "__main__":
    main()
