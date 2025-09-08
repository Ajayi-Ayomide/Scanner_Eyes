# Database Setup Guide for Scanner Eyes

## Prerequisites
1. **XAMPP** installed and running
2. **Python** with required packages installed
3. **MySQL** service running in XAMPP

## Quick Setup

### 1. Start XAMPP
- Open XAMPP Control Panel
- Start **Apache** and **MySQL** services
- Ensure both show "Running" status

### 2. Configure Environment
Copy the example environment file:
```bash
cp env.example .env
```

The `.env` file should contain:
```env
DATABASE_TYPE=mysql
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=scanner_eyes
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create Database and Tables
```bash
python setup_database.py
```

## Database Access Methods

### Method 1: phpMyAdmin (Recommended)
1. Open your web browser
2. Go to: `http://localhost/phpmyadmin`
3. Username: `root`
4. Password: (leave empty)
5. Select database: `scanner_eyes`

### Method 2: MySQL Command Line
```bash
mysql -u root -p
# Enter password (press Enter if no password)
USE scanner_eyes;
SHOW TABLES;
```

### Method 3: Python Script
```python
from database.db import get_db
from database.models import ScanResult, Vulnerability, Suggestion

# Get database session
db = next(get_db())

# Query data
scan_results = db.query(ScanResult).all()
vulnerabilities = db.query(Vulnerability).all()
suggestions = db.query(Suggestion).all()
```

## Database Schema

### Tables Created:
1. **scan_results** - Stores network scan results
2. **vulnerabilities** - Stores detected vulnerabilities
3. **suggestions** - Stores AI-generated security suggestions

### Sample Queries:

#### View all scan results:
```sql
SELECT * FROM scan_results ORDER BY timestamp DESC;
```

#### View high-risk vulnerabilities:
```sql
SELECT * FROM vulnerabilities WHERE severity IN ('Critical', 'High');
```

#### View suggestions by type:
```sql
SELECT * FROM suggestions WHERE vulnerability_type = 'RTSP';
```

## Troubleshooting

### Common Issues:

1. **"Access denied for user 'root'"**
   - Check if MySQL is running in XAMPP
   - Verify username/password in .env file

2. **"Can't connect to MySQL server"**
   - Start MySQL service in XAMPP
   - Check if port 3306 is available

3. **"Database doesn't exist"**
   - Run `python setup_database.py`
   - Check database name in .env file

4. **"Module not found"**
   - Install requirements: `pip install -r requirements.txt`
   - Activate virtual environment if using one

### Reset Database:
```bash
# Drop and recreate database
mysql -u root -e "DROP DATABASE IF EXISTS scanner_eyes;"
python setup_database.py
```

## Development Tips

1. **Backup Database**: Export from phpMyAdmin before major changes
2. **View Logs**: Check XAMPP logs if issues persist
3. **Test Connection**: Use `python -c "from database.db import engine; print('Connected!')"`
4. **Monitor Queries**: Enable query logging in MySQL for debugging

## Production Considerations

For production deployment:
1. Change default MySQL password
2. Create dedicated database user
3. Enable SSL connections
4. Set up regular backups
5. Configure proper firewall rules
