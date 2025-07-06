#!/bin/bash

echo "🚀 Deploying ResuMatch Backend with Persistent Storage to Render..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Are you in the project root?"
    exit 1
fi

# Check if git is configured
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Show current status
echo "📋 Current status:"
echo "  - Git branch: $(git branch --show-current)"
echo "  - Uncommitted changes: $(git status --porcelain | wc -l)"
echo "  - Last commit: $(git log -1 --pretty=format:'%h %s')"
echo ""

# Confirm deployment
read -p "❓ Deploy to Render? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🚫 Deployment cancelled"
    exit 1
fi

# Add and commit changes
echo "📝 Committing changes..."
git add .
git commit -m "feat: Add persistent storage service to prevent mock data usage

- Add persistent storage service with PostgreSQL support
- Remove automatic sample data creation in production
- Add environment variable controls (ENABLE_SAMPLE_DATA)
- Update all endpoints to use persistent storage
- Add database dependencies and configuration
- Update Render deployment configuration

This ensures real user-uploaded resumes are always used instead of mock data."

# Push to main branch
echo "🚀 Pushing to main branch..."
git push origin main

echo "✅ Deployment initiated!"
echo ""
echo "📊 Monitor deployment:"
echo "  - Render Dashboard: https://dashboard.render.com/"
echo "  - Build logs will show storage type initialization"
echo "  - Look for: 'Initialized persistent storage: json' or 'postgres'"
echo ""
echo "🔧 Environment Variables to set in Render Dashboard:"
echo "  - ENABLE_SAMPLE_DATA: false (critical for production)"
echo "  - DATABASE_URL: postgresql://... (optional but recommended)"
echo "  - OPENROUTER_API_KEY: your_api_key_here"
echo ""
echo "🎯 Expected behavior:"
echo "  - No mock/sample data in production"
echo "  - Only real user-uploaded resumes in search results"
echo "  - Persistent storage across container restarts (if DATABASE_URL set)"
