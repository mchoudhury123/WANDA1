# 🏢 Salon CRM - Complete Business Management System

A modern, comprehensive CRM system built specifically for salon businesses with multi-portal access, real-time data, and progressive web app capabilities.

## 🌟 Key Features

- **6 Specialized Portals** - Director, Admin, HR, Staff, Management, Finance
- **Progressive Web App** - Works online/offline, installable on mobile
- **Real-time Data** - Firebase integration with live updates
- **Multi-business Support** - Manage multiple salon locations
- **Complete Business Suite** - From appointments to payroll to analytics

## 🚀 Quick Start for Mac Users

### Prerequisites
```bash
# Install Node.js (18+ required)
brew install node

# Verify installation
node --version  # Should be 18.x or higher
```

### Setup (5 minutes)
```bash
# 1. Clone this repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/salon-crm

# 2. Setup environment variables
cp ENV_EXAMPLE.txt .env

# 3. Install dependencies
npm install

# 4. Start the CRM
npm start
```

The CRM will open at `http://localhost:3000` 🎉

### What You'll See
- **No login required** - Automatically logged in as Director
- **Portal Selection Page** with access to all 6 portals
- **Complete CRM functionality** ready to use

## 📊 Portal Overview

### 👑 Director Portal
- Business analytics and reporting
- Strategic decision making tools
- Multi-location oversight
- Financial performance tracking

### 📊 Admin Portal
- Day-to-day operations management
- Appointment scheduling
- Client and staff management
- Service configuration

### 👥 HR Portal
- Employee management
- Payroll processing
- Performance tracking
- Training management
- Shift scheduling

### 👤 Staff Portal
- Personal calendar and appointments
- Client management
- Performance metrics
- Earnings tracking

### 💼 Management Portal
- Resource management
- Inventory control
- Service and product management
- Operational efficiency

### 💰 Finance Portal
- Revenue tracking
- Expense management
- Financial reporting
- Budget planning
- Tax management

## 🔧 Project Structure

```
├── salon-crm/                    # Main React application
│   ├── src/
│   │   ├── pages/                # Portal pages
│   │   │   ├── director-portal/
│   │   │   ├── admin-portal/
│   │   │   ├── hr-portal/
│   │   │   ├── staff-portal/
│   │   │   ├── management-portal/
│   │   │   └── finance-portal/
│   │   ├── components/           # Reusable components
│   │   ├── services/            # Firebase and API services
│   │   └── context/             # State management
│   ├── public/                  # PWA assets and icons
│   └── package.json
├── scripts/                     # Deployment and setup scripts
├── firebase.json               # Firebase configuration
├── firestore.rules            # Database security rules
└── SETUP_GUIDE.md             # Detailed setup instructions
```

## 📱 PWA Features

The CRM works as a mobile app:
- **Offline Support** - Works without internet
- **Install Prompt** - Add to home screen on mobile
- **Background Sync** - Syncs when connection returns
- **Native Feel** - App-like experience

## 🔐 Security & Multi-Tenancy

- **Firebase Authentication** with tenant isolation
- **Secure Firestore Rules** ensuring data privacy
- **Role-based Access Control** for different user types
- **Multi-business Support** with data separation

## 🛠️ Development

### Available Scripts
```bash
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
npm run dev    # Alternative start command
```

### Environment Variables
Copy `ENV_EXAMPLE.txt` to `.env` and configure:
- Firebase settings (included and working)
- Optional: Google Calendar, Slack integrations

## 🚀 Deployment

### Firebase Hosting
```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### PWA Installation
1. Open the CRM in Chrome/Safari
2. Click "Add to Home Screen" 
3. Use like a native app!

## 🎯 Business Features

### Client Management
- Complete client profiles
- Appointment history
- Service preferences
- Package tracking
- Visit analytics

### Appointment System
- Multi-staff scheduling
- Service booking
- Calendar integration
- Automated reminders
- Conflict resolution

### Staff Management
- Employee profiles
- Performance tracking
- Schedule management
- Commission tracking
- Training records

### Financial Management
- Revenue tracking
- Expense monitoring
- Payroll processing
- Tax reporting
- Profit analytics

### Business Intelligence
- Performance dashboards
- Client behavior analytics
- Staff productivity metrics
- Revenue forecasting
- Market insights

## 📞 Support

Need help? Check out:
1. **SETUP_GUIDE.md** - Detailed setup instructions
2. **Troubleshooting** - Common issues and solutions
3. **Component Documentation** - In-code documentation

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Restart development server
npm start
```

## 🏆 What Makes This CRM Special

- **Built for Salons** - Industry-specific features
- **All-in-One Solution** - No need for multiple tools
- **Modern Technology** - React, Firebase, PWA
- **Mobile-First** - Works perfectly on phones/tablets
- **Scalable** - Grows with your business
- **Secure** - Enterprise-level security

---

## 🎉 Ready to Transform Your Salon Business?

This CRM includes everything you need to run a modern salon:
- Complete booking system
- Staff and client management  
- Financial tracking and reporting
- HR and payroll management
- Business analytics and insights
- Mobile app functionality

Get started in 5 minutes with the quick setup above! 🚀 