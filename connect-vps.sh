#!/bin/bash

# Script para conectar à VPS e diagnosticar problemas
# Uso: ./connect-vps.sh [comando]
#
# Requer arquivo .vps.env com as seguintes variáveis:
#   VPS_IP=your.vps.ip.address
#   VPS_USER=your_username

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
    echo ""
    echo "Você pode copiar .vps.env.example como base:"
    echo "  cp .vps.env.example .vps.env"
    echo "  # Edite .vps.env com seus valores reais"
    exit 1
fi

# Verificar se as variáveis foram definidas
if [ -z "$VPS_IP" ] || [ -z "$VPS_USER" ]; then
    echo "❌ Erro: VPS_IP ou VPS_USER não estão definidos no .vps.env"
    echo ""
    echo "Verifique se o arquivo .vps.env contém:"
    echo "  VPS_IP=your.vps.ip.address"
    echo "  VPS_USER=your_username"
    exit 1
fi

echo "🔌 Conectando à VPS ($VPS_USER@$VPS_IP)..."
echo ""

if [ -z "$1" ]; then
    # Se não passar comando, conecta interativamente
    ssh $VPS_USER@$VPS_IP
else
    # Se passar comando, executa na VPS
    ssh $VPS_USER@$VPS_IP "$1"
fi

