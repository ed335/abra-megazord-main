#!/bin/bash

# Script completo para corrigir erro 502 na VPS
# Execute na VPS: bash vps-fix-502.sh

set -e

echo "🔧 =========================================="
echo "   CORREÇÃO DE ERRO 502 - AbraCann"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar se está no diretório correto
echo "📁 1. Verificando diretório do projeto..."
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${YELLOW}⚠️  ecosystem.config.js não encontrado no diretório atual${NC}"
    echo "   Procurando projeto..."
    if [ -d "$HOME/abra-megazord" ]; then
        cd "$HOME/abra-megazord"
        echo -e "${GREEN}✅ Encontrado em: $HOME/abra-megazord${NC}"
    elif [ -d "/root/abra-megazord" ]; then
        cd "/root/abra-megazord"
        echo -e "${GREEN}✅ Encontrado em: /root/abra-megazord${NC}"
    else
        echo -e "${RED}❌ Projeto não encontrado. Por favor, navegue até o diretório do projeto.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Diretório correto: $(pwd)${NC}"
fi
echo ""

# 2. Verificar status atual do PM2
echo "📊 2. Verificando status do PM2..."
if command_exists pm2; then
    pm2 status
    echo ""
else
    echo -e "${RED}❌ PM2 não está instalado!${NC}"
    echo "   Instalando PM2..."
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 instalado${NC}"
    echo ""
fi

# 3. Verificar se os builds existem
echo "🔨 3. Verificando builds existentes..."
echo "   Backend:"
if [ -d "backend/dist" ] && [ "$(ls -A backend/dist 2>/dev/null)" ]; then
    echo -e "   ${GREEN}✅ Build do backend encontrado${NC}"
    ls -lh backend/dist/ | head -5
else
    echo -e "   ${YELLOW}⚠️  Build do backend não encontrado${NC}"
fi

echo "   Frontend:"
if [ -d "web/.next" ] && [ "$(ls -A web/.next 2>/dev/null)" ]; then
    echo -e "   ${GREEN}✅ Build do frontend encontrado${NC}"
    ls -lh web/.next/ | head -5
else
    echo -e "   ${YELLOW}⚠️  Build do frontend não encontrado${NC}"
fi
echo ""

# 4. Verificar dependências
echo "📦 4. Verificando dependências..."
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências do backend não instaladas${NC}"
    echo "   Instalando dependências do backend..."
    cd backend && npm install && cd ..
    echo -e "${GREEN}✅ Dependências do backend instaladas${NC}"
fi

if [ ! -d "web/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências do frontend não instaladas${NC}"
    echo "   Instalando dependências do frontend..."
    cd web && npm install && cd ..
    echo -e "${GREEN}✅ Dependências do frontend instaladas${NC}"
fi
echo ""

# 5. Executar builds
echo "🔨 5. Executando builds..."
echo "   Backend..."
cd backend
if npm run build; then
    echo -e "   ${GREEN}✅ Build do backend concluído${NC}"
else
    echo -e "   ${RED}❌ Erro no build do backend${NC}"
    echo "   Verifique os erros acima"
    exit 1
fi
cd ..

echo "   Frontend..."
cd web
if npm run build; then
    echo -e "   ${GREEN}✅ Build do frontend concluído${NC}"
else
    echo -e "   ${RED}❌ Erro no build do frontend${NC}"
    echo "   Verifique os erros acima"
    exit 1
fi
cd ..
echo ""

# 6. Verificar variáveis de ambiente
echo "🔐 6. Verificando variáveis de ambiente..."
if [ -f "backend/.env" ]; then
    echo -e "   ${GREEN}✅ backend/.env existe${NC}"
    if grep -q "DATABASE_URL" backend/.env; then
        echo -e "   ${GREEN}✅ DATABASE_URL configurado${NC}"
    else
        echo -e "   ${YELLOW}⚠️  DATABASE_URL não encontrado${NC}"
    fi
    if grep -q "JWT_SECRET" backend/.env; then
        echo -e "   ${GREEN}✅ JWT_SECRET configurado${NC}"
    else
        echo -e "   ${YELLOW}⚠️  JWT_SECRET não encontrado${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  backend/.env não encontrado${NC}"
fi

if [ -f "web/.env.local" ]; then
    echo -e "   ${GREEN}✅ web/.env.local existe${NC}"
else
    echo -e "   ${YELLOW}⚠️  web/.env.local não encontrado${NC}"
fi
echo ""

# 7. Parar processos PM2 existentes
echo "🛑 7. Parando processos PM2 existentes..."
pm2 delete all 2>/dev/null || echo "   Nenhum processo PM2 rodando"
echo ""

# 8. Iniciar serviços com PM2
echo "🚀 8. Iniciando serviços com PM2..."
if pm2 start ecosystem.config.js --env production; then
    echo -e "${GREEN}✅ Serviços iniciados${NC}"
    pm2 save
    echo -e "${GREEN}✅ Configuração salva${NC}"
else
    echo -e "${RED}❌ Erro ao iniciar serviços${NC}"
    exit 1
fi
echo ""

# 9. Aguardar serviços iniciarem
echo "⏳ 9. Aguardando serviços iniciarem (10 segundos)..."
sleep 10
echo ""

# 10. Verificar status final
echo "📊 10. Status final dos serviços:"
pm2 status
echo ""

# 11. Verificar portas
echo "🌐 11. Verificando portas:"
if command_exists netstat; then
    netstat -tuln | grep -E ':(3000|3001)' || echo "   Nenhuma porta encontrada"
elif command_exists ss; then
    ss -tuln | grep -E ':(3000|3001)' || echo "   Nenhuma porta encontrada"
else
    echo "   Ferramenta de verificação de portas não disponível"
fi
echo ""

# 12. Testar endpoints
echo "🧪 12. Testando endpoints:"
echo "   Backend (porta 3001):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|404"; then
    echo -e "   ${GREEN}✅ Backend respondendo${NC}"
else
    echo -e "   ${RED}❌ Backend não está respondendo${NC}"
fi

echo "   Frontend (porta 3000):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404"; then
    echo -e "   ${GREEN}✅ Frontend respondendo${NC}"
else
    echo -e "   ${RED}❌ Frontend não está respondendo${NC}"
fi
echo ""

# 13. Verificar logs
echo "📋 13. Últimas linhas dos logs:"
echo "   Backend:"
pm2 logs abracann-backend --lines 5 --nostream 2>/dev/null || echo "   Nenhum log disponível"
echo ""
echo "   Frontend:"
pm2 logs abracann-web --lines 5 --nostream 2>/dev/null || echo "   Nenhum log disponível"
echo ""

# 14. Verificar Nginx
echo "🌐 14. Verificando Nginx:"
if command_exists nginx; then
    if sudo nginx -t 2>/dev/null; then
        echo -e "   ${GREEN}✅ Configuração do Nginx está correta${NC}"
        echo "   Recarregando Nginx..."
        sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null || echo "   Não foi possível recarregar Nginx"
    else
        echo -e "   ${YELLOW}⚠️  Problema na configuração do Nginx${NC}"
        echo "   Execute: sudo nginx -t"
    fi
else
    echo "   Nginx não encontrado"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Processo concluído!${NC}"
echo "=========================================="
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs em tempo real: pm2 logs"
echo "   Ver status: pm2 status"
echo "   Reiniciar: pm2 restart all"
echo "   Parar: pm2 stop all"
echo ""

