# IoT Security Scanner - Scanner Eyes

A comprehensive IoT security scanning and vulnerability management platform with AI-powered fix assistance.

## 🏗️ Application Structure

### **New Workflow:**
1. **Dashboard** - Overview and analytics
2. **Network Scan** - Discover and scan IoT devices
3. **Vulnerabilities** - View all detected security issues
4. **Fix Assistant** - Get AI-powered step-by-step fixes
5. **Analytics** - Security metrics and trends
6. **History** - Scan and fix history
7. **Settings** - Application configuration

### **Key Improvements:**
- ✅ **Integrated Workflow**: Scan → Vulnerabilities → Fix Assistant
- ✅ **Better FixAssistant**: Now shows actual vulnerabilities with step-by-step fixes
- ✅ **Database Choice**: PostgreSQL for production, SQLite for development
- ✅ **Navigation**: Direct links between related features

## 🗄️ Database Recommendations

### **Development (SQLite)**
- Fast setup and development
- No additional installation required
- Good for testing and prototyping

### **Production (PostgreSQL)**
- Better performance for large datasets
- ACID compliance for security data
- Better concurrency handling
- Built-in JSON support for scan results
- Recommended for production deployments

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (for production)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd scanner_eyes
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Database Setup**
```bash
# For development (SQLite - default)
python init_db.py

# For production (PostgreSQL)
# 1. Install PostgreSQL
# 2. Create database: iot_scanner
# 3. Copy env.example to .env and configure
# 4. Set DATABASE_TYPE=postgresql
```

4. **Frontend Setup**
```bash
cd ..
npm install
```

5. **Start the Application**
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm run dev
```

## 🔧 Configuration

### Environment Variables
Copy `backend/env.example` to `backend/.env` and configure:

```env
# Database
DATABASE_TYPE=sqlite  # or postgresql
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=iot_scanner

# API
API_HOST=0.0.0.0
API_PORT=8000

# OpenAI (for AI assistant)
OPENAI_API_KEY=your_key_here
```

## 📱 Features

### **Network Scanner**
- Auto-discovery of IoT devices
- Manual IP targeting
- Port scanning
- Vulnerability detection

### **Fix Assistant**
- **Vulnerabilities Tab**: List all found security issues
- **Fix Steps Tab**: Step-by-step remediation guides
- **AI Chat Tab**: Interactive security guidance
- Integration with scan results

### **Vulnerability Management**
- Risk level classification
- Status tracking (Open/Fixed)
- Detailed vulnerability descriptions
- Fix recommendations

### **Analytics & History**
- Scan history tracking
- Security metrics
- Trend analysis
- Export capabilities

## 🔒 Security Features

- Network device discovery
- Port vulnerability scanning
- Default credential detection
- Firmware version checking
- Security posture assessment
- AI-powered fix recommendations

## 🛠️ Development

### Project Structure
```
scanner_eyes/
├── backend/
│   ├── database/          # Database models and config
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   └── main.py           # FastAPI application
├── src/
│   ├── Components/        # React components
│   │   ├── Scan.jsx      # Network scanning
│   │   ├── FixAssistant.jsx  # Vulnerability fixes
│   │   ├── Vulnerabilities.jsx  # Vulnerability list
│   │   └── ...
│   └── App.jsx           # Main application
└── README.md
```

### API Endpoints
- `GET /scan/auto` - Auto network discovery
- `POST /scan/` - Manual device scanning
- `GET /vulnerabilities/` - List vulnerabilities
- `POST /assistant/fix` - Get fix steps
- `POST /assistant/` - AI chat assistance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Note**: This application is for educational and security testing purposes. Always ensure you have proper authorization before scanning networks.
