# 🚀 Google Cloud Quick Start (Ubuntu VM)

Guia enxuto para subir o projeto em uma VM (Ubuntu 22.04+). Use com usuário com sudo. Abra apenas as portas necessárias (22, 3000, 3001, 5050, 8025 se precisar MailHog/pgAdmin).

## Copiar e colar

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Instalando dependências do sistema..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl git docker.io docker-compose

echo "🔧 Instalando Node.js 20 (se não existir)..."
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "👤 Dando permissão para usar Docker sem sudo..."
sudo usermod -aG docker "$USER"

echo "📥 Clonando repositório..."
git clone https://github.com/ed335/abra-megazord.git
cd abra-megazord

echo "📦 Instalando dependências backend..."
cd backend && npm install
echo "📦 Instalando dependências frontend..."
cd ../web && npm install
cd ..

echo "🐳 Subindo banco e utilidades..."
docker-compose up -d

echo "🗄️ Gerando Prisma Client e migrations..."
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
cd ..

echo "🔐 Criando envs padrão..."
cp backend/.env.example backend/.env
cp web/.env.example web/.env.local

echo ""
echo "✅ Pronto! Em dois terminais separados:"
echo "Terminal 1: cd ~/abra-megazord/backend && npm run start:dev"
echo "Terminal 2: cd ~/abra-megazord/web && npm run dev"
echo ""
echo "🌐 Acessos:"
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:3001/api"
echo "- pgAdmin:  http://localhost:5050 (admin@abracann.local / admin)"
echo "- MailHog:  http://localhost:8025"
```

> Dica: se o `docker-compose up -d` falhar por permissão, rode `newgrp docker` e repita. Se a porta 5432 já estiver em uso, altere a porta no `docker-compose.yml` e na `DATABASE_URL` do backend.
