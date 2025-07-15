#!/bin/bash

# ===== CONFIGURATION =====
PM2_NAME="remove-bg"     # Name used in PM2
BRANCH="main"            # Git branch to pull from

# ===== DEPLOYMENT =====
echo "🔁 Starting deployment..."

# 1. Save current directory as app root
APP_DIR=$(pwd)
echo "📂 Working directory: $APP_DIR"

# 2. Pull latest code
echo "📥 Pulling latest code from $BRANCH..."
git pull origin "$BRANCH"

# 3. Install/update dependencies
echo "📦 Installing/updating dependencies..."
npm install

# 4. Build the Next.js app
echo "🔨 Building the app..."
npm run build

# 5. Restart the app via PM2
echo "🚀 Restarting PM2 process: $PM2_NAME..."
pm2 restart "$PM2_NAME"

echo "✅ Deployment finished!"
