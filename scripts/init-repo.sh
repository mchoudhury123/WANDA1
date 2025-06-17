#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="salon-crm-private"
DEFAULT_BRANCH="main"

echo -e "${BLUE}🚀 Initializing Git repository and GitHub setup${NC}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first:${NC}"
    echo -e "${YELLOW}   Visit: https://cli.github.com/${NC}"
    exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI is not authenticated. Running auth flow...${NC}"
    gh auth login
fi

echo -e "${BLUE}📁 Initializing Git repository...${NC}"

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${YELLOW}⚠️  Git repository already exists${NC}"
fi

# Set default branch to main
git checkout -b $DEFAULT_BRANCH 2>/dev/null || git checkout $DEFAULT_BRANCH

echo -e "${BLUE}📦 Adding and committing files...${NC}"

# Add all files
git add .

# Check if there are any changes to commit
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    # Commit initial files
    git commit -m "Initial commit: Salon CRM with PWA, multi-tenant support, and CI/CD"
    echo -e "${GREEN}✅ Initial commit created${NC}"
fi

echo -e "${BLUE}🌐 Creating private GitHub repository...${NC}"

# Create private GitHub repository
if gh repo create $REPO_NAME --private --source=. --remote=origin --push; then
    echo -e "${GREEN}✅ Private GitHub repository created: $REPO_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  Repository may already exist or there was an error${NC}"
fi

echo -e "${BLUE}🔒 Setting up branch protection...${NC}"

# Wait a moment for the repository to be fully created
sleep 2

# Enable branch protection with required PR reviews
gh api repos/:owner/$REPO_NAME/branches/$DEFAULT_BRANCH/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Branch protection enabled for $DEFAULT_BRANCH branch${NC}"
else
    echo -e "${YELLOW}⚠️  Branch protection setup may have failed (this is common for new repos)${NC}"
fi

echo -e "${BLUE}📝 Setting up repository secrets...${NC}"
echo -e "${YELLOW}⚠️  You'll need to manually set up the following GitHub secrets:${NC}"
echo -e "${YELLOW}   1. GCP_WIP - Your Google Cloud Workload Identity Provider${NC}"
echo -e "${YELLOW}   2. GCP_PROJECT - Your Google Cloud Project ID${NC}"
echo -e "${YELLOW}${NC}"
echo -e "${YELLOW}   Run these commands to set them up:${NC}"
echo -e "${YELLOW}   gh secret set GCP_WIP${NC}"
echo -e "${YELLOW}   gh secret set GCP_PROJECT${NC}"

echo -e "${GREEN}🎉 Repository setup complete!${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "   🔗 Repository: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo -e "   🌿 Default branch: $DEFAULT_BRANCH"
echo -e "   🔒 Branch protection: Enabled"
echo -e "   🔐 Repository visibility: Private"
echo -e "${BLUE}${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "   1. Set up GCP_WIP and GCP_PROJECT secrets"
echo -e "   2. Configure Google Cloud Workload Identity"
echo -e "   3. Push changes to trigger CI/CD workflow" 