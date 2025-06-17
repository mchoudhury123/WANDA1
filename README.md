# Salon CRM - Multi-Tenant PWA with Secure CI/CD

A modern, multi-tenant Salon CRM Progressive Web App built with React, Firebase, and secure CI/CD deployment.

## 🚀 Features

- **Progressive Web App (PWA)** - Installable, offline-capable
- **Multi-tenant Architecture** - Support for multiple salon businesses
- **Firebase Authentication** - Secure user management with tenant isolation
- **Real-time Data** - Firestore integration with security rules
- **Secure CI/CD** - GitHub Actions with OIDC authentication
- **Modern UI** - React with Tailwind CSS

## 📁 Project Structure

```
├── salon-crm/                 # Main React application
│   ├── src/
│   │   ├── services/firebase.ts   # Firebase config with multi-tenant auth
│   │   ├── sw.js              # Service worker for PWA
│   │   └── ...
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── icons/             # PWA icons
│   └── package.json
├── scripts/
│   ├── onboardTenant.ts       # Tenant onboarding script
│   └── init-repo.sh          # GitHub repository setup
├── .github/workflows/
│   └── deploy.yml            # CI/CD pipeline
├── firebase.json             # Firebase configuration
└── firestore.rules          # Multi-tenant security rules
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Firebase CLI: `npm install -g firebase-tools`
- GitHub CLI: [Install gh CLI](https://cli.github.com/)
- Google Cloud Project with Firebase enabled

### 2. Install Dependencies

```bash
# Root dependencies (for scripts)
npm install

# Application dependencies
cd salon-crm
npm install
```

### 3. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase use --add YOUR_PROJECT_ID

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### 4. PWA Setup

The PWA is pre-configured with:
- ✅ Service worker (`salon-crm/src/sw.js`)
- ✅ Web manifest (`salon-crm/public/manifest.json`)
- ✅ Icons in `salon-crm/public/icons/`
- ✅ Build configuration with Workbox

### 5. Multi-Tenant Configuration

A tenant has been pre-configured for "Nadia Beauty Salon":

```bash
# The following command was already run:
firebase target:apply hosting nadia-beauty-salon nadia-beauty-salon
```

To add more tenants:

```bash
# Run the onboarding script
npm run onboard-tenant -- --slug your-salon-slug --displayName "Your Salon Name"
```

### 6. GitHub Repository Setup

```bash
# Make the script executable (Linux/Mac)
chmod +x scripts/init-repo.sh

# Run the repository setup script
./scripts/init-repo.sh
```

This will:
- Initialize Git repository
- Create private GitHub repository
- Set up branch protection
- Configure deployment pipeline

### 7. Configure GitHub Secrets

Set up the required secrets for CI/CD:

```bash
gh secret set GCP_WIP --body "YOUR_WORKLOAD_IDENTITY_PROVIDER"
gh secret set GCP_PROJECT --body "YOUR_GCP_PROJECT_ID"
```

### 8. Google Cloud Workload Identity Setup

1. Create a Workload Identity Pool:
```bash
gcloud iam workload-identity-pools create "github-actions" \
  --location="global" \
  --description="For GitHub Actions"
```

2. Create a Workload Identity Provider:
```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository"
```

3. Create a service account:
```bash
gcloud iam service-accounts create firebase-deployer \
  --display-name="Firebase Deployer"
```

4. Grant necessary permissions:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:firebase-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"
```

## 🔧 Development

### Local Development

```bash
cd salon-crm
npm start
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
cd salon-crm
npm run build
```

### Deploy to Firebase

```bash
firebase deploy --only hosting:nadia-beauty-salon
```

## 🔒 Security Features

### Multi-Tenant Security Rules

Firestore rules ensure tenant isolation:

```javascript
// All documents must have tenantId field matching user's tenant
match /{document=**} {
  allow read, write: if request.auth != null && 
    request.auth.token.tid == resource.data.tenantId;
}
```

### CI/CD Security

- **OIDC Authentication** - No secret keys stored in GitHub
- **Branch Protection** - Requires PR reviews and status checks
- **Private Repository** - Source code is private by default

## 📱 PWA Features

- **Offline Support** - Works without internet connection
- **Install Prompt** - Can be installed on mobile/desktop
- **App-like Experience** - Standalone display mode
- **Background Sync** - Syncs data when connection is restored

## 🌐 Multi-Tenant Features

### Current Tenants

- **Nadia Beauty Salon** (`nadia-beauty-salon`)
  - Tenant ID: `tenant_nadia-beauty-salon_default`
  - Hosting Target: `nadia-beauty-salon`

### Adding New Tenants

1. Run the onboarding script:
```bash
npm run onboard-tenant -- --slug new-salon --displayName "New Salon"
```

2. Update Firebase hosting configuration
3. Deploy to the new hosting target

## 🚀 Deployment

### Automatic Deployment

Pushes to `main` branch trigger automatic deployment via GitHub Actions:

1. **Build** - Installs dependencies and builds the app
2. **Test** - Runs test suite with coverage
3. **Deploy** - Deploys to Firebase using OIDC authentication

### Manual Deployment

```bash
# Deploy everything
firebase deploy

# Deploy specific targets
firebase deploy --only hosting:nadia-beauty-salon
firebase deploy --only firestore:rules
```

## 📊 Monitoring

- **Firebase Analytics** - User engagement tracking
- **Performance Monitoring** - App performance metrics
- **Error Reporting** - Automatic error tracking

## 🤝 Contributing

1. Create a feature branch
2. Make changes and write tests
3. Submit a pull request
4. Automated CI/CD will run tests and deploy on merge

## 📄 License

Private - All rights reserved

---

## 🆘 Troubleshooting

### Common Issues

1. **PWA not installing**: Check manifest.json and service worker registration
2. **Multi-tenant auth failing**: Verify tenantId is set correctly in Firebase Auth
3. **CI/CD failing**: Check GitHub secrets and Google Cloud permissions
4. **Build errors**: Ensure all dependencies are installed with `npm ci`

### Support

For issues specific to your deployment, check:
- Firebase Console logs
- GitHub Actions workflow runs
- Browser Developer Tools (for PWA issues) 