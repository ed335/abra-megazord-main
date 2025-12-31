#!/bin/bash

# Script para corrigir erro 502 na VPS
# Execute localmente: ./fix-502-vps.sh

VPS_IP="31.97.93.100"
VPS_USER="root"
PROJECT_PATH="/root/abra-megazord"  # Ajuste se necessário

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

