#!/usr/bin/env python3
"""
Database backup script for IoT Security Scanner
This script creates automated backups of the PostgreSQL database
"""

import os
import sys
import subprocess
import logging
from datetime import datetime, timedelta
import argparse
from pathlib import Path

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from production import (
    DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME,
    BACKUP_PATH, BACKUP_RETENTION_DAYS
)

def setup_logging():
    """Setup logging for the backup script"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/backup.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def create_backup_directory():
    """Create backup directory if it doesn't exist"""
    backup_dir = Path(BACKUP_PATH)
    backup_dir.mkdir(parents=True, exist_ok=True)
    return backup_dir

def create_backup():
    """Create a new database backup"""
    logger = setup_logging()
    backup_dir = create_backup_directory()
    
    # Generate backup filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"iot_scanner_backup_{timestamp}.sql"
    backup_path = backup_dir / backup_filename
    
    try:
        # Set environment variables for pg_dump
        env = os.environ.copy()
        env['PGPASSWORD'] = DB_PASSWORD
        
        # Build pg_dump command
        cmd = [
            'pg_dump',
            '-h', DB_HOST,
            '-p', str(DB_PORT),
            '-U', DB_USER,
            '-d', DB_NAME,
            '-f', str(backup_path),
            '--verbose',
            '--no-password'
        ]
        
        logger.info(f"Starting backup: {backup_filename}")
        
        # Execute backup command
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            # Get file size
            file_size = backup_path.stat().st_size
            logger.info(f"Backup completed successfully: {backup_filename} ({file_size} bytes)")
            return backup_path
        else:
            logger.error(f"Backup failed: {result.stderr}")
            return None
            
    except Exception as e:
        logger.error(f"Backup error: {str(e)}")
        return None

def cleanup_old_backups():
    """Remove backups older than retention period"""
    logger = setup_logging()
    backup_dir = Path(BACKUP_PATH)
    
    if not backup_dir.exists():
        logger.warning("Backup directory does not exist")
        return
    
    cutoff_date = datetime.now() - timedelta(days=BACKUP_RETENTION_DAYS)
    deleted_count = 0
    
    try:
        for backup_file in backup_dir.glob("iot_scanner_backup_*.sql"):
            file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
            
            if file_time < cutoff_date:
                backup_file.unlink()
                logger.info(f"Deleted old backup: {backup_file.name}")
                deleted_count += 1
        
        logger.info(f"Cleanup completed: {deleted_count} old backups removed")
        
    except Exception as e:
        logger.error(f"Cleanup error: {str(e)}")

def list_backups():
    """List all available backups"""
    logger = setup_logging()
    backup_dir = Path(BACKUP_PATH)
    
    if not backup_dir.exists():
        logger.warning("Backup directory does not exist")
        return
    
    backups = []
    for backup_file in backup_dir.glob("iot_scanner_backup_*.sql"):
        file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
        file_size = backup_file.stat().st_size
        backups.append({
            'name': backup_file.name,
            'date': file_time,
            'size': file_size
        })
    
    # Sort by date (newest first)
    backups.sort(key=lambda x: x['date'], reverse=True)
    
    print(f"\nAvailable backups ({len(backups)} total):")
    print("-" * 80)
    print(f"{'Filename':<30} {'Date':<20} {'Size':<15}")
    print("-" * 80)
    
    for backup in backups:
        size_mb = backup['size'] / (1024 * 1024)
        print(f"{backup['name']:<30} {backup['date'].strftime('%Y-%m-%d %H:%M:%S'):<20} {size_mb:.2f} MB")

def restore_backup(backup_filename):
    """Restore database from backup"""
    logger = setup_logging()
    backup_dir = Path(BACKUP_PATH)
    backup_path = backup_dir / backup_filename
    
    if not backup_path.exists():
        logger.error(f"Backup file not found: {backup_filename}")
        return False
    
    try:
        # Set environment variables for psql
        env = os.environ.copy()
        env['PGPASSWORD'] = DB_PASSWORD
        
        # Build psql command
        cmd = [
            'psql',
            '-h', DB_HOST,
            '-p', str(DB_PORT),
            '-U', DB_USER,
            '-d', DB_NAME,
            '-f', str(backup_path),
            '--verbose',
            '--no-password'
        ]
        
        logger.info(f"Starting restore from: {backup_filename}")
        
        # Execute restore command
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("Restore completed successfully")
            return True
        else:
            logger.error(f"Restore failed: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"Restore error: {str(e)}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="IoT Security Scanner Database Backup Tool")
    parser.add_argument('--backup', action='store_true', help='Create a new backup')
    parser.add_argument('--cleanup', action='store_true', help='Clean up old backups')
    parser.add_argument('--list', action='store_true', help='List all backups')
    parser.add_argument('--restore', type=str, help='Restore from backup file')
    
    args = parser.parse_args()
    
    # Create logs directory
    Path('logs').mkdir(exist_ok=True)
    
    if args.backup:
        create_backup()
    elif args.cleanup:
        cleanup_old_backups()
    elif args.list:
        list_backups()
    elif args.restore:
        restore_backup(args.restore)
    else:
        # Default: create backup and cleanup
        create_backup()
        cleanup_old_backups()

if __name__ == "__main__":
    main()
