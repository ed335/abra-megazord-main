#!/bin/bash

# Script para corrigir erro 502 na VPS
# Execute localmente: ./fix-502-vps.sh
#
# Requer arquivo .vps.env com as seguintes variáveis:
#   VPS_IP=your.vps.ip.address
#   VPS_USER=your_username
#   VPS_PROJECT_PATH=/path/to/project

# Carregar variáveis de ambiente do arquivo .vps.env
if [ -f ".vps.env" ]; then
    source .vps.env
elif [ -f "$HOME/.vps.env" ]; then
    source "$HOME/.vps.env"
else
    echo "❌ Erro: Arquivo .vps.env não encontrado!"
    echo ""
    echo "Crie um arquivo .vps.env na raiz do projeto ou em $HOME/.vps.env"
    echo "com as seguintes variáveis:"
    echo "  VPS_IP=your.vps.ip.address"
    echo "  VPS_USER=your_username"
    echo "  VPS_PROJECT_PATH=/path/to/project"
    echo ""
    echo "Você pode copiar .vps.env.example como base:"
    echo "  cp .vps.env.example .vps.env"
    exit 1
fi

# Verificar se as variáveis foram definidas
if [ -z "$VPS_IP" ] || [ -z "$VPS_USER" ]; then
    echo "❌ Erro: VPS_IP ou VPS_USER não estão definidos no .vps.env"
    exit 1
fi

# Usar VPS_PROJECT_PATH se definido, caso contrário usar padrão
PROJECT_PATH="${VPS_PROJECT_PATH:-/home/$VPS_USER/abra-megazord}"

echo "🔧 Corrigindo erro 502 na VPS..."
echo ""

# 1. Verificar status atual
echo "📊 1. Verificando status do PM2..."
ssh $VPS_USER@$VPS_IP "pm2 status"
echo ""

# 2. Verificar se os builds existem
echo "🔨 2. Verificando builds..."
ssh $VPS_USER@$VPS_IP "cd $PROJECT_PATH/backend && ls -la dist/ 2>/dev/null || echo '❌ Build do backend não encontrado'"
ssh $VPS_USER@$VPS_IP "cd $PROJECT_PATH/web && ls -la .next/ 2>/dev/null || echo '❌ Build do frontend não encontrado'"
echo ""

# 3. Fazer builds se necessário
echo "🔨 3. Executando builds..."
ssh $VPS_USER@$VPS_IP "cd $PROJECT_PATH/backend && npm run build"
ssh $VPS_USER@$VPS_IP "cd $PROJECT_PATH/web && npm run build"
echo ""

# 4. Reiniciar PM2
echo "🔄 4. Reiniciando serviços PM2..."
ssh $VPS_USER@$VPS_IP "cd $PROJECT_PATH && pm2 restart all"
echo ""

# 5. Verificar status final
echo "✅ 5. Status final:"
ssh $VPS_USER@$VPS_IP "pm2 status"
echo ""

# 6. Verificar portas
echo "🌐 6. Verificando portas:"
ssh $VPS_USER@$VPS_IP "netstat -tuln | grep -E ':(3000|3001)'"
echo ""

echo "✅ Processo concluído!"
echo "📋 Para ver logs: ssh $VPS_USER@$VPS_IP 'pm2 logs'"

