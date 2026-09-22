#!/bin/bash

# ============================================================================
# DEPLOY SCRIPT COMPLETO - COPIAR E EXECUTAR NO HOSTINGER SSH
# ============================================================================
# Instruções:
# 1. SSH no Hostinger (ou usar Terminal no hPanel)
# 2. cd /caminho/para/projeto (normalmente ~/public_html ou similar)
# 3. curl https://raw.githubusercontent.com/oronlopescv-sudo/marcuscatia/main/scripts/deploy.sh | bash
# OU:
# 3. bash < /dev/stdin << 'DEPLOY_EOF'
#    [colar este script]
#    DEPLOY_EOF
# ============================================================================

set -e

echo "🚀 DEPLOY CATIA COOKING - HOSTINGER"
echo "======================================"
echo ""

# 1. UPDATE do código
echo "📥 1. Updating code from GitHub..."
git pull origin main || echo "⚠️  Git pull failed - continuing anyway"

# 2. Instalar dependências
echo "📦 2. Installing dependencies..."
npm install

# 3. Database migrations
# Run once manually (not on every deploy) after the app is up:
#   curl -X POST http://localhost:3000/api/admin/migrate \
#     -H "Content-Type: application/json" \
#     -d '{"secret": "<ADMIN_SECRET from .env>"}'
# This creates all tables (IF NOT EXISTS), so it's safe to re-run.
echo "🗄️  3. Skipping migrations (run manually once the app is up - see script comments)"

# 4. Build
echo "🔨 4. Building Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# 5. Restart (se usando PM2)
echo "♻️  5. Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart marcuscatia || pm2 start npm --name marcuscatia -- start
    echo "✅ PM2 restart complete"
else
    echo "⚠️  PM2 not found - please restart manually with: npm start"
fi

echo ""
echo "✅ DEPLOY COMPLETE!"
echo ""
echo "Next steps:"
echo "  • Test: curl https://site.com/api/reservations"
echo "  • Check: /admin (create booking)"
echo "  • Gallery: /galeria (add photo)"
echo ""
echo "======================================"
