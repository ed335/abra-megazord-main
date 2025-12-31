#!/bin/bash

# Script para conectar à VPS e diagnosticar problemas
# Uso: ./connect-vps.sh [comando]

VPS_IP="31.97.93.100"
VPS_USER="root"

echo "🔌 Conectando à VPS ($VPS_USER@$VPS_IP)..."
echo ""

if [ -z "$1" ]; then
    # Se não passar comando, conecta interativamente
    ssh $VPS_USER@$VPS_IP
else
    # Se passar comando, executa na VPS
    ssh $VPS_USER@$VPS_IP "$1"
fi

