#!/bin/bash

# Script para diagnosticar problemas na VPS
# Execute na VPS: bash diagnose-vps.sh

echo "🔍 Diagnóstico da VPS - AbraCann"
echo "=================================="
echo ""

echo "📊 Status dos serviços PM2:"
pm2 status
echo ""

echo "📋 Logs do Backend (últimas 20 linhas):"
pm2 logs abracann-backend --lines 20 --nostream
echo ""

echo "📋 Logs do Frontend (últimas 20 linhas):"
pm2 logs abracann-web --lines 20 --nostream
echo ""

echo "🌐 Verificando portas:"
echo "Porta 3000 (Frontend):"
netstat -tuln | grep :3000 || echo "  ❌ Porta 3000 não está em uso"
echo "Porta 3001 (Backend):"
netstat -tuln | grep :3001 || echo "  ❌ Porta 3001 não está em uso"
echo ""

echo "🔧 Status do Nginx:"
sudo systemctl status nginx --no-pager -l | head -20
echo ""

echo "📝 Últimas linhas do log de erro do Nginx:"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "  ⚠️  Log não encontrado"
echo ""

echo "💾 Espaço em disco:"
df -h | grep -E '^/dev|Filesystem'
echo ""

echo "🧠 Uso de memória:"
free -h
echo ""

echo "✅ Diagnóstico completo!"

