#!/bin/bash

# Catia Cooking Mindelo - Deployment Script para Hostinger
# Execute: bash deploy.sh

echo "🚀 Iniciando deployment no Hostinger..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Preparar diretório
echo -e "${YELLOW}1. Preparando diretórios...${NC}"
mkdir -p ~/marcuscatia
cd ~/marcuscatia

# 2. Download do repositório (alternativa ao git clone)
echo -e "${YELLOW}2. Baixando repositório...${NC}"
curl -L https://github.com/oronlopescv-sudo/marcuscatia/archive/refs/heads/main.zip -o main.zip
unzip -q main.zip
mv marcuscatia-main/* .
rm -rf marcuscatia-main main.zip

# 3. Verificar Node.js
echo -e "${YELLOW}3. Verificando Node.js...${NC}"
node --version
npm --version

# 4. Instalar dependências
echo -e "${YELLOW}4. Instalando dependências...${NC}"
npm install --legacy-peer-deps

# 5. Criar .env.production.local
echo -e "${YELLOW}5. Configurando ambiente...${NC}"
cat > .env.production.local << 'ENV'
# Database (configure com suas credenciais)
DATABASE_URL="mysql://usuario:senha@localhost:3306/catia_cooking_db"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="catia_cooking_db"
DB_USER="usuario"
DB_PASSWORD="senha"

# App
APP_URL="https://seu-dominio.com"
NODE_ENV="production"
GEMINI_API_KEY=""
ENV

echo -e "${YELLOW}⚠️  EDITE o arquivo .env.production.local com suas credenciais!${NC}"

# 6. Build
echo -e "${YELLOW}6. Fazendo build...${NC}"
npm run build

# 7. Iniciar servidor
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${GREEN}🚀 Iniciando servidor...${NC}"
npm start

