#!/bin/bash

set -e

echo "=========================================="
echo "  ABRACANM - Script de Setup/Atualização"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ] && [ ! -d "web" ]; then
    print_error "Execute este script na raiz do projeto ABRACANM"
    exit 1
fi

# Detectar se é primeira instalação ou atualização
if [ -d "web/node_modules" ]; then
    MODE="update"
    echo "Modo: ATUALIZAÇÃO"
else
    MODE="install"
    echo "Modo: INSTALAÇÃO INICIAL"
fi

echo ""
echo "1. Verificando variáveis de ambiente..."
echo "----------------------------------------"

# Verificar variáveis obrigatórias
REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET")
OPTIONAL_VARS=("SYNCPAY_CLIENT_ID" "SYNCPAY_CLIENT_SECRET" "AGORA_APP_ID" "AGORA_APP_CERTIFICATE" "SMTP_HOST" "SMTP_USER" "SMTP_PASS" "EVOLUTION_API_URL" "EVOLUTION_API_KEY")

missing_required=false
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Variável obrigatória não configurada: $var"
        missing_required=true
    else
        print_status "$var configurada"
    fi
done

if [ "$missing_required" = true ]; then
    echo ""
    print_error "Configure as variáveis obrigatórias antes de continuar."
    echo "Copie o arquivo .env.example para .env e configure:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

echo ""
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "$var não configurada (opcional)"
    else
        print_status "$var configurada"
    fi
done

echo ""
echo "2. Instalando dependências do frontend (web)..."
echo "------------------------------------------------"
cd web
npm install --legacy-peer-deps
print_status "Dependências do frontend instaladas"

echo ""
echo "3. Instalando dependências do backend..."
echo "-----------------------------------------"
cd ../backend
npm install
print_status "Dependências do backend instaladas"

echo ""
echo "4. Gerando cliente Prisma..."
echo "----------------------------"
cd ../web
npx prisma generate
print_status "Cliente Prisma gerado (web)"

cd ../backend
npx prisma generate
print_status "Cliente Prisma gerado (backend)"

echo ""
echo "5. Atualizando banco de dados..."
echo "---------------------------------"
cd ../web

if [ "$MODE" = "update" ]; then
    echo "Aplicando alterações no schema (mantendo dados existentes)..."
    print_warning "Se houver conflitos no schema, revise manualmente antes de continuar."
    echo ""
    if ! npx prisma db push; then
        echo ""
        print_error "Falha ao sincronizar o banco de dados."
        print_warning "Isso pode ocorrer se houver alterações destrutivas no schema."
        echo ""
        echo "Opções:"
        echo "  1. Revise o schema e remova alterações destrutivas"
        echo "  2. Faça backup do banco e execute: npx prisma db push --accept-data-loss"
        echo "  3. Para ambiente de dev, use: npx prisma migrate reset"
        exit 1
    fi
else
    echo "Criando estrutura do banco de dados..."
    npx prisma db push
fi
print_status "Banco de dados sincronizado"

echo ""
echo "6. Construindo aplicações..."
echo "----------------------------"
echo "Construindo frontend..."
npm run build
print_status "Frontend construído"

cd ../backend
echo "Construindo backend..."
npm run build
print_status "Backend construído"

echo ""
echo "=========================================="
echo -e "${GREEN}  Setup concluído com sucesso!${NC}"
echo "=========================================="
echo ""
echo "Para iniciar a aplicação:"
echo ""
echo "  Frontend (porta 5000):"
echo "    cd web && npm start"
echo ""
echo "  Backend (porta 3001):"
echo "    cd backend && npm run start:prod"
echo ""
echo "  Ou com PM2:"
echo "    pm2 start ecosystem.config.js"
echo ""
echo "Primeiro acesso: /admin/setup"
echo ""
