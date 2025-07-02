# 🚀 Complete CRM Setup Guide for Mac

This guide will help you get the Salon CRM running perfectly on your Mac.

## 📋 Prerequisites

### 1. Install Node.js and npm
```bash
# Using Homebrew (recommended)
brew install node

# Verify installation
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### 2. Install Git (if not already installed)
```bash
# Check if git is installed
git --version

# If not installed:
brew install git
```

## 🔧 Quick Setup (5 minutes)

### Step 1: Clone the Repository
```bash
# Clone to your desired directory
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### Step 2: Setup Environment Variables
```bash
# Navigate to the salon-crm directory
cd salon-crm

# Copy the example environment file
cp .env.example .env

# The .env file is already configured with working Firebase settings!
# No additional setup needed for basic functionality
```

### Step 3: Install Dependencies
```bash
# Install dependencies (this may take 2-3 minutes)
npm install
```

### Step 4: Start the Development Server
```bash
# Start the CRM
npm start
```

The CRM will automatically open in your browser at `http://localhost:3000` 🎉

## 🎯 What You'll See

### Default Login Credentials
- **No login required!** The app automatically logs you in as a Director user
- You'll see the Portal Selection page with access to all portals:
  - 👑 Director Portal
  - 👤 Staff Portal  
  - 📊 Admin Portal
  - 👥 HR Portal
  - 💼 Management Portal
  - 💰 Finance Portal

### Available Features
- ✅ Client Management
- ✅ Appointment Scheduling
- ✅ Staff Management
- ✅ Business Management
- ✅ Service & Product Management
- ✅ Financial Reporting
- ✅ HR & Payroll
- ✅ Analytics Dashboard

## 🛠️ Troubleshooting

### Problem: "npm start" not found
**Solution:**
```bash
# Make sure you're in the salon-crm directory
pwd  # Should show: /path/to/your/repo/salon-crm

# If not, navigate to it:
cd salon-crm

# Then try again:
npm start
```

### Problem: Dependencies installation fails
**Solution:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port 3000 already in use
**Solution:**
```bash
# Kill any process using port 3000
sudo lsof -ti:3000 | xargs kill -9

# Or start on a different port
PORT=3001 npm start
```

### Problem: Node.js version too old
**Solution:**
```bash
# Update Node.js using Homebrew
brew upgrade node

# Or use Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

## 🔌 Optional Integrations

### Google Calendar Integration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Update `.env` file with your credentials

### Slack Integration
1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new Slack app
3. Configure OAuth & Permissions
4. Update `.env` file with your credentials

## 📱 PWA (Mobile App) Features

The CRM can be installed as a mobile app:

1. Open the CRM in Safari on your iPhone/iPad
2. Tap the Share button
3. Select "Add to Home Screen"
4. The CRM will now work like a native app!

## 🔄 Updating the CRM

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Restart the development server
npm start
```

## 📞 Support

If you encounter any issues:

1. Check this troubleshooting guide first
2. Make sure you're in the `salon-crm` directory
3. Verify Node.js version: `node --version` (should be 18+)
4. Try clearing cache: `npm cache clean --force`
5. Reinstall dependencies: `rm -rf node_modules && npm install`

## 🎉 You're All Set!

Your Salon CRM is now ready to use with all features enabled:
- Multi-business management
- Complete appointment system
- Staff and client management
- Financial reporting
- HR management
- And much more!

Enjoy your new CRM system! 🚀 