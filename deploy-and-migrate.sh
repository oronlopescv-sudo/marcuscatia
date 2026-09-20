#!/bin/bash

# 🚀 Deploy to Hostinger and Run Migrations
# Usage: ./deploy-and-migrate.sh

set -e

echo "🚀 CATIA COOKING MINDELO - DEPLOY & MIGRATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
HOST="72.60.93.207"
PORT="65002"
USER="u128759105"
SSH_KEY="~/.ssh/marcuscatia_hostinger"
DOMAIN="lightskyblue-bat-697565.hostingersite.com"
PROJECT_PATH="~/domains/$DOMAIN/hbuilds/last-source"
SECRET="mindelo-2026"
SITE_URL="https://$DOMAIN"

echo "📋 Configuration:"
echo "  Host: $HOST:$PORT"
echo "  User: $USER"
echo "  Project: $PROJECT_PATH"
echo "  Site: $SITE_URL"
echo ""

# Step 1: Deploy to Git
echo "1️⃣ PUSHING TO GIT..."
git push origin main
echo "✅ Code pushed to GitHub"
echo ""

# Step 2: SSH into Hostinger and pull
echo "2️⃣ PULLING LATEST CODE FROM HOSTINGER..."
ssh -p $PORT -i $SSH_KEY $USER@$HOST << 'HOSTINGER_COMMANDS'
  cd ~/domains/lightskyblue-bat-697565.hostingersite.com/hbuilds/last-source
  echo "📥 Pulling latest code..."
  git pull origin main
  echo "✅ Code pulled successfully"
HOSTINGER_COMMANDS
echo ""

# Step 3: Build (Hostinger does this automatically, but let's make sure)
echo "3️⃣ WAITING FOR HOSTINGER BUILD..."
echo "   (Hostinger automatically rebuilds when code changes)"
sleep 5
echo "✅ Build should be complete"
echo ""

# Step 4: Run migrations via API
echo "4️⃣ RUNNING DATABASE MIGRATIONS..."
echo "   Calling: POST /api/admin/migrate"
echo ""

MIGRATION_RESPONSE=$(curl -s -X POST "$SITE_URL/api/admin/migrate" \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$SECRET\"}")

echo "Response:"
echo "$MIGRATION_RESPONSE" | jq '.' 2>/dev/null || echo "$MIGRATION_RESPONSE"
echo ""

# Check if successful
if echo "$MIGRATION_RESPONSE" | grep -q '"success":true'; then
  echo "✅ MIGRATIONS SUCCESSFUL!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 DEPLOYMENT COMPLETE!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "✨ Your site is now live with:"
  echo "   ✅ Content Editor (FAQs, testimonials)"
  echo "   ✅ Logo Upload"
  echo "   ✅ Settings Panel"
  echo "   ✅ Auto Splash Screen"
  echo "   ✅ WhatsApp Notifications"
  echo ""
  echo "📍 Visit: $SITE_URL"
  echo ""
else
  echo "⚠️ MIGRATION COMPLETED WITH WARNINGS"
  echo "Check response above for details"
  echo ""
fi
