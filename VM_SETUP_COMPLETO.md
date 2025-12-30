# 🛠️ Setup Completo na VM (Ubuntu 22.04+)

Guia detalhado para preparar a VM, subir a infra local (Postgres, MailHog, pgAdmin) e rodar backend + frontend.

## 1) Pré-requisitos
- Acesso sudo, Git, internet liberada.
- Ports abertas somente se precisar acessar de fora: 22 (SSH), 3000 (web), 3001 (API), 5050 (pgAdmin), 8025 (MailHog).
- Node 20+ e npm 9+ (instalação abaixo).
- Docker + Docker Compose.

## 2) Clonar o repositório
```bash
git clone https://github.com/ed335/abra-megazord.git
cd abra-megazord
```

## 3) Instalar ferramentas de sistema (se faltar)
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git docker.io docker-compose

# Node 20 (NodeSource)
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Usar Docker sem sudo (sair e entrar na sessão se necessário)
sudo usermod -aG docker "$USER"
```

## 4) Instalar dependências do projeto
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd web
npm install
cd ..
```

## 5) Subir infraestrutura (DB, pgAdmin, MailHog)
```bash
docker-compose up -d
docker-compose ps   # deve mostrar containers "Up"
```

## 6) Configurar variáveis de ambiente
- Backend (`backend/.env`):
  ```
  DATABASE_URL="postgresql://abracann_user:abracann_password@localhost:5432/abracann_dev"
  API_PORT=3001
  API_URL=http://localhost:3001
  FRONTEND_URL=http://localhost:3000
  CORS_ORIGIN=http://localhost:3000
  # ajuste as demais chaves (JWT_SECRET, SMTP, ENCRYPTION_KEY etc.)
  ```
- Frontend (`web/.env.local`):
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001
  NEXT_PUBLIC_API_TIMEOUT=30000
  NEXT_PUBLIC_AUTH_DOMAIN=localhost
  ```
- Baseie-se nos arquivos `.env.example` já presentes.

## 7) Prisma (gerar client e migrations)
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init   # primeira vez
cd ..
```
Se já existirem migrations, basta `npm run prisma:migrate`.

## 8) Rodar os serviços
- Terminal 1 (backend):
  ```bash
  cd backend
  npm run start:dev
  ```
- Terminal 2 (frontend):
  ```bash
  cd web
  npm run dev
  ```

## 9) URLs úteis
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- pgAdmin: http://localhost:5050 (login: admin@abracann.local / senha: admin)
- MailHog: http://localhost:8025

## 10) Testes rápidos
```bash
curl http://localhost:3001/api/health
curl -I http://localhost:3000
```

## 11) Troubleshooting rápido
- **Permissão Docker**: rode `newgrp docker` e tente de novo.
- **Porta 5432 em uso**: altere para 5433 em `docker-compose.yml` e na `DATABASE_URL`.
- **Migrate falhou**: cheque `.env`, suba o Docker, depois `npm run prisma:generate` e `npm run prisma:migrate`.
- **Node errado**: `node -v` precisa ser 20+. Reinstale com NodeSource (passo 3).
- **SSH aberto**: feche portas não utilizadas ou configure firewall (ufw) para evitar exposição desnecessária.

Pronto! Se todos os passos acima passaram, a VM está pronta para rodar o projeto.
