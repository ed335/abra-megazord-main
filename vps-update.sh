#!/bin/bash

# Script para atualizar a VPS com o último commit do GitHub
# Execute na VPS: bash vps-update.sh

set -e

echo "🔄 =========================================="
echo "   ATUALIZAÇÃO DA VPS - AbraCann"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar se está no diretório do projeto
echo "📁 1. Verificando diretório do projeto..."
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Diretório .git não encontrado${NC}"
    if [ -d "$HOME/abra-megazord" ]; then
        cd "$HOME/abra-megazord"
    elif [ -d "/root/abra-megazord" ]; then
        cd "/root/abra-megazord"
    else
        echo -e "${RED}❌ Projeto Git não encontrado${NC}"
        exit 1
    fi
fi

PROJECT_DIR=$(pwd)
echo -e "${GREEN}✅ Diretório: $PROJECT_DIR${NC}"
echo ""

# 2. Verificar status atual do Git
echo "📊 2. Verificando status do Git..."
git status
echo ""

# 3. Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Branch atual: $CURRENT_BRANCH"
echo ""

# 4. Salvar mudanças locais (se houver)
echo "💾 3. Verificando mudanças locais..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Há mudanças locais não commitadas${NC}"
    read -p "Deseja fazer stash das mudanças? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        git stash save "Backup antes de atualizar - $(date +%Y-%m-%d_%H:%M:%S)"
        echo -e "${GREEN}✅ Mudanças salvas em stash${NC}"
    else
        echo -e "${RED}❌ Atualização cancelada${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Nenhuma mudança local${NC}"
fi
echo ""

# 5. Buscar atualizações do GitHub
echo "📥 4. Buscando atualizações do GitHub..."
git fetch origin
echo ""

# 6. Ver commits que serão puxados
echo "📋 5. Commits que serão aplicados:"
git log HEAD..origin/$CURRENT_BRANCH --oneline 2>/dev/null || echo "   Nenhum commit novo"
echo ""

# 7. Fazer pull
echo "⬇️  6. Fazendo pull do GitHub..."
if git pull origin $CURRENT_BRANCH; then
    echo -e "${GREEN}✅ Código atualizado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao fazer pull${NC}"
    echo "   Verifique se há conflitos ou problemas de conexão"
    exit 1
fi
echo ""

# 8. Verificar se há mudanças no package.json
echo "📦 7. Verificando dependências..."
BACKEND_CHANGED=false
FRONTEND_CHANGED=false

if git diff HEAD@{1} HEAD --name-only | grep -q "backend/package.json"; then
    BACKEND_CHANGED=true
    echo -e "${YELLOW}⚠️  package.json do backend foi alterado${NC}"
fi

if git diff HEAD@{1} HEAD --name-only | grep -q "web/package.json"; then
    FRONTEND_CHANGED=true
    echo -e "${YELLOW}⚠️  package.json do frontend foi alterado${NC}"
fi

if [ "$BACKEND_CHANGED" = false ] && [ "$FRONTEND_CHANGED" = false ]; then
    echo -e "${GREEN}✅ Nenhuma mudança nas dependências${NC}"
fi
echo ""

# 9. Instalar dependências (se necessário)
if [ "$BACKEND_CHANGED" = true ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 8. Instalando dependências do backend..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Dependências do backend instaladas${NC}"
fi

if [ "$FRONTEND_CHANGED" = true ] || [ ! -d "web/node_modules" ]; then
    echo "📦 9. Instalando dependências do frontend..."
    cd web
    npm install
    cd ..
    echo -e "${GREEN}✅ Dependências do frontend instaladas${NC}"
fi
echo ""

# 10. Verificar se ecosystem.config.js mudou
if git diff HEAD@{1} HEAD --name-only | grep -q "ecosystem.config.js"; then
    echo -e "${YELLOW}⚠️  ecosystem.config.js foi alterado${NC}"
    echo "   Será necessário reiniciar o PM2"
fi
echo ""

# 11. Executar builds
echo "🔨 10. Executando builds..."
echo "   Backend..."
cd backend
if npm run build; then
    echo -e "   ${GREEN}✅ Build do backend concluído${NC}"
else
    echo -e "   ${RED}❌ Erro no build do backend${NC}"
    exit 1
fi
cd ..

echo "   Frontend..."
cd web
if npm run build; then
    echo -e "   ${GREEN}✅ Build do frontend concluído${NC}"
else
    echo -e "   ${RED}❌ Erro no build do frontend${NC}"
    exit 1
fi
cd ..
echo ""

# 12. Verificar se PM2 está rodando
echo "🔄 11. Verificando PM2..."
if command -v pm2 >/dev/null 2>&1; then
    PM2_RUNNING=$(pm2 list | grep -c "online\|stopped" || echo "0")
    if [ "$PM2_RUNNING" -gt 0 ]; then
        echo -e "${GREEN}✅ PM2 está rodando${NC}"
        echo "   Reiniciando serviços..."
        pm2 restart all
        echo -e "${GREEN}✅ Serviços reiniciados${NC}"
    else
        echo -e "${YELLOW}⚠️  Nenhum processo PM2 rodando${NC}"
        echo "   Iniciando serviços..."
        pm2 start ecosystem.config.js --env production
        pm2 save
        echo -e "${GREEN}✅ Serviços iniciados${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 não está instalado${NC}"
    echo "   Instale o PM2: npm install -g pm2"
fi
echo ""

# 13. Aguardar serviços iniciarem
echo "⏳ 12. Aguardando serviços iniciarem (10 segundos)..."
sleep 10
echo ""

# 14. Verificar status final
echo "📊 13. Status final:"
pm2 status 2>/dev/null || echo "   PM2 não disponível"
echo ""

# 15. Testar endpoints
echo "🧪 14. Testando endpoints:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|404"; then
    echo -e "   ${GREEN}✅ Backend respondendo${NC}"
else
    echo -e "   ${RED}❌ Backend não está respondendo${NC}"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404"; then
    echo -e "   ${GREEN}✅ Frontend respondendo${NC}"
else
    echo -e "   ${RED}❌ Frontend não está respondendo${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Atualização concluída!${NC}"
echo "=========================================="
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: pm2 logs"
echo "   Ver status: pm2 status"
echo "   Ver stash: git stash list"
echo "   Aplicar stash: git stash pop"
echo ""

