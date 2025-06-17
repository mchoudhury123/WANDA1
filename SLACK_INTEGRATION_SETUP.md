# 🚀 Slack Integration Setup Guide

## Overview

This guide will help you set up the comprehensive Slack messaging system that has replaced the Google Messages integration across all CRM portals (Admin, Director, HR, Management, and Staff).

## ✅ What's Been Implemented

### New Components
- **SlackMessages.tsx** - Main Slack UI component with role-based channel access
- **SlackSidebar.tsx** - Channel navigation and user profile display
- **SlackThread.tsx** - Message thread with real-time chat interface
- **useSlack.ts** - Custom hook for Slack API communication

### Updated Portals
All portal message pages have been updated to use the new Slack system:
- `/admin-portal/messages` - Admin role with admin-only channels
- `/director-portal/messages` - Director role with executive channels  
- `/hr-portal/messages` - HR role with hiring and support channels
- `/management-portal/messages` - Management role with operations channels
- `/staff-portal/messages` - Staff role with team coordination channels

### Removed
- ❌ `GoogleChatIntegration.tsx` component
- ❌ All Google Messages references and UI

## 🔧 Environment Variables Setup

Create a `.env` file in your project root with the following Slack credentials:

```env
# Slack Integration
VITE_SLACK_CLIENT_ID=your-slack-client-id
VITE_SLACK_CLIENT_SECRET=your-slack-client-secret
VITE_SLACK_REDIRECT_URI=http://localhost:3000/slack-auth-callback
VITE_SLACK_BOT_TOKEN=xoxb-your-bot-token
```

## 📋 Slack App Setup Instructions

### Step 1: Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter app name: `Salon CRM Integration`
5. Select your workspace
6. Click **"Create App"**

### Step 2: Configure OAuth & Permissions

1. Navigate to **"OAuth & Permissions"** in the sidebar
2. Add the following **Bot Token Scopes**:
   ```
   chat:write
   channels:history
   channels:read
   users:read
   im:read
   im:write
   groups:read
   groups:history
   ```
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/slack-auth-callback
   https://yourdomain.com/slack-auth-callback
   ```

### Step 3: Install App to Workspace

1. Click **"Install to Workspace"** button
2. Authorize the app
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
4. Copy the **Client ID** and **Client Secret** from **Basic Information**

### Step 4: Create Channels

Set up role-based channels in your Slack workspace:

#### Admin Channels
- `#general` (public)
- `#admin-only` (private)
- `#staff-management` (private)

#### Director Channels  
- `#general` (public)
- `#director-hub` (private)
- `#business-strategy` (private)

#### HR Channels
- `#general` (public)
- `#hr-support` (private)
- `#hiring` (private)

#### Management Channels
- `#general` (public)
- `#operations` (public)
- `#scheduling` (public)

#### Staff Channels
- `#general` (public)
- `#staff-room` (public)
- `#clinic-1-chat` (public)

## 🎯 Features

### Role-Based Access
Each user role sees different channels based on their permissions:
- **Admin**: Full access to all channels including admin-only
- **Director**: Executive channels for strategic discussions
- **HR**: Human resources and hiring channels
- **Management**: Operations and scheduling coordination
- **Staff**: Team rooms and location-specific channels

### Slack UI Features
- **Authentic Slack Design**: Purple sidebar with Slack branding
- **Real-time Messaging**: Send and receive messages instantly
- **Channel Switcher**: Easy navigation between channels
- **User Profiles**: Display user avatars and online status
- **Message Threading**: Support for threaded conversations
- **File Attachments**: Share files and documents (via Slack)
- **Emoji Reactions**: React to messages with emojis
- **Search**: Search through channels and messages

### Authentication Flow
1. User clicks "Connect to Slack"
2. Redirects to Slack OAuth authorization
3. User grants permissions
4. Redirected back to CRM with access token
5. Token stored locally for future sessions

## 🔨 Development Setup

### Install Dependencies
The required Slack packages are already installed:
```bash
npm install @slack/web-api @slack/socket-mode
```

### Component Usage
```tsx
import SlackMessages from './components/common/messages/SlackMessages';

// In your portal component
<SlackMessages userRole="admin" />
```

### Custom Hook Usage
```tsx
import useSlack from './components/common/messages/useSlack';

const {
  isAuthenticated,
  authenticate,
  sendMessage,
  channels,
  messages
} = useSlack();
```

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:
```env
VITE_SLACK_CLIENT_ID=your-production-client-id
VITE_SLACK_CLIENT_SECRET=your-production-client-secret
VITE_SLACK_REDIRECT_URI=https://yourdomain.com/slack-auth-callback
VITE_SLACK_BOT_TOKEN=xoxb-your-production-bot-token
```

### Slack App Configuration
1. Update redirect URLs to include production domains
2. Configure workspace-level permissions
3. Set up channel membership automation
4. Configure webhooks for real-time updates

## 📱 Mobile Responsiveness

The Slack integration is fully responsive:
- **Desktop**: Full sidebar with channel list
- **Mobile**: Collapsible sidebar with icon-only view
- **Tablet**: Adaptive layout based on screen size

## 🔮 Future Enhancements

The current implementation supports future features:

### AI Integration
- Slack bot for appointment booking
- AI-powered customer service responses
- Automated staff scheduling notifications

### Advanced Features
- Message search and filtering
- File sharing integration
- Video call integration with Slack Huddles
- Custom slash commands for CRM actions

### Analytics
- Message activity tracking
- Channel engagement metrics
- Team communication insights

## 🛠️ Troubleshooting

### Common Issues

**Authentication Fails**
- Check client ID and secret are correct
- Verify redirect URI matches exactly
- Ensure app is installed to workspace

**Channels Not Loading**
- Verify bot token has correct scopes
- Check bot is added to channels
- Confirm network connectivity

**Messages Not Sending**
- Verify `chat:write` scope is enabled
- Check bot has permission to post in channel
- Ensure user is authenticated

### Debug Mode
Set debug environment variable:
```env
VITE_SLACK_DEBUG=true
```

## 📞 Support

For technical support:
1. Check this documentation
2. Review Slack API documentation
3. Check browser console for errors
4. Verify environment variables are set correctly

## 🎉 Migration Complete

Your CRM now features a professional Slack integration with:
- ✅ Role-based channel access
- ✅ Real-time messaging
- ✅ Authentic Slack UI/UX
- ✅ Mobile responsive design
- ✅ OAuth authentication
- ✅ Scalable architecture

The Google Messages integration has been completely replaced with this modern, enterprise-grade Slack solution! 