# ABRACANM - Guia de Instalação e Deploy

Este guia explica como instalar e configurar a aplicação ABRACANM em um servidor VPS ou ambiente de produção.

## Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação Rápida](#instalação-rápida)
3. [Configuração Detalhada](#configuração-detalhada)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Banco de Dados](#banco-de-dados)
6. [Build e Produção](#build-e-produção)
7. [PM2 - Gerenciador de Processos](#pm2---gerenciador-de-processos)
8. [Nginx - Proxy Reverso](#nginx---proxy-reverso)
9. [SSL/HTTPS](#sslhttps)
10. [Segurança](#segurança)
11. [Manutenção](#manutenção)
12. [Solução de Problemas](#solução-de-problemas)

---

## Requisitos do Sistema

### Software Necessário

| Software | Versão Mínima | Comando para verificar |
|----------|---------------|------------------------|
| Node.js | 18.x ou superior | `node --version` |
| npm | 9.x ou superior | `npm --version` |
| PostgreSQL | 14.x ou superior | `psql --version` |
| Git | 2.x | `git --version` |

### Hardware Recomendado

- **CPU**: 2 vCPUs
- **RAM**: 2 GB (mínimo 1 GB)
- **Disco**: 20 GB SSD
- **Sistema Operacional**: Ubuntu 22.04 LTS, Debian 12, ou similar

---

## Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/abracanm.git
cd abracanm

# 2. Instale as dependências
cd web && npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações

# 4. Configure o banco de dados
npx prisma migrate deploy
npx prisma generate

# 5. Build para produção
npm run build

# 6. Inicie a aplicação
npm start
```

---

## Configuração Detalhada

### 1. Instalar Node.js (via NVM)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20
```

### 2. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Criar Banco de Dados

```bash
# Acessar como usuário postgres
sudo -u postgres psql

# Criar usuário e banco
CREATE USER abracanm WITH PASSWORD 'sua_senha_segura';
CREATE DATABASE abracanm_db OWNER abracanm;
GRANT ALL PRIVILEGES ON DATABASE abracanm_db TO abracanm;

# Sair
\q
```

### 4. Clonar e Configurar o Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/abracanm.git
cd abracanm/web

# Instale as dependências
npm install

# Copie o arquivo de exemplo de variáveis
cp .env.example .env
```

---

## Variáveis de Ambiente

Edite o arquivo `.env` com as seguintes configurações:

```env
# ============================================
# BANCO DE DADOS (OBRIGATÓRIO)
# ============================================
DATABASE_URL="postgresql://abracanm:sua_senha@localhost:5432/abracanm_db"

# ============================================
# AUTENTICAÇÃO (OBRIGATÓRIO)
# ============================================
# Gere uma chave segura com: openssl rand -base64 32
JWT_SECRET="sua-chave-jwt-muito-segura-com-pelo-menos-32-caracteres"

# ============================================
# SERVIDOR (OPCIONAL)
# ============================================
# Porta do servidor (padrão: 3000 em produção)
PORT=3000

# URL base da aplicação
NEXT_PUBLIC_APP_URL="https://seudominio.com.br"

# ============================================
# UPLOADS (OPCIONAL)
# ============================================
# Diretório para uploads (padrão: ./uploads)
UPLOAD_DIR="./uploads"

# Tamanho máximo de upload em bytes (padrão: 10MB)
MAX_FILE_SIZE=10485760
```

### Gerar JWT_SECRET Seguro

```bash
# Linux/Mac
openssl rand -base64 32

# Ou use este comando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Banco de Dados

### Aplicar Migrations (Produção)

```bash
cd web

# Aplicar migrations existentes (RECOMENDADO para produção)
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

> **Nota**: Use `prisma migrate deploy` em produção para aplicar as migrations já commitadas. 
> Use `prisma db push` apenas em desenvolvimento para sincronização rápida.

### Habilitar Extensões do PostgreSQL

Antes de criar o administrador, habilite as extensões necessárias:

```bash
# Acesse o banco de dados como superusuário
sudo -u postgres psql -d abracanm_db

# Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Sair
\q
```

### Criar Administrador Inicial

**Opção 1: Via Script Node.js (Recomendado)**

Crie um arquivo `create-admin.js` na pasta `web`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const senha = await bcrypt.hash('sua_senha_segura', 10);
  
  const admin = await prisma.paciente.create({
    data: {
      nomeCompleto: 'Administrador',
      email: 'admin@abracanm.org.br',
      whatsapp: '11999999999',
      senha: senha,
      role: 'ADMIN',
      ativo: true
    }
  });
  
  console.log('Admin criado:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:
```bash
cd web
node create-admin.js
rm create-admin.js  # Remova após criar
```

**Opção 2: Via SQL**

```bash
# Primeiro, gere o hash da senha
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('sua_senha', 10).then(h => console.log(h));"

# Acesse o banco de dados
psql -U abracanm -d abracanm_db

# Insira o administrador (substitua o hash gerado acima)
INSERT INTO "Paciente" (
  "id",
  "nomeCompleto",
  "email",
  "whatsapp",
  "senha",
  "role",
  "ativo",
  "criadoEm"
) VALUES (
  gen_random_uuid(),
  'Administrador',
  'admin@abracanm.org.br',
  '11999999999',
  '$2b$10$COLE_O_HASH_AQUI',
  'ADMIN',
  true,
  NOW()
);
```

### Backup do Banco

```bash
# Criar backup
pg_dump -U abracanm -d abracanm_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -U abracanm -d abracanm_db < backup.sql
```

---

## Build e Produção

### Build da Aplicação

```bash
cd web

# Build para produção
npm run build
```

### Iniciar em Produção

```bash
# Iniciar servidor de produção
npm start

# Ou especificar porta
PORT=3000 npm start
```

---

## PM2 - Gerenciador de Processos

O PM2 mantém a aplicação rodando continuamente e reinicia automaticamente em caso de falhas.

### Instalar PM2

```bash
npm install -g pm2
```

### Usar com ecosystem.config.js

O arquivo `ecosystem.config.js` já está configurado na raiz do projeto:

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração para reinício automático
pm2 save
pm2 startup

# Verificar status
pm2 status

# Ver logs
pm2 logs abracanm

# Reiniciar
pm2 restart abracanm

# Parar
pm2 stop abracanm
```

### Comandos Úteis do PM2

```bash
# Monitorar recursos
pm2 monit

# Listar processos
pm2 list

# Recarregar sem downtime
pm2 reload abracanm

# Deletar processo
pm2 delete abracanm
```

---

## Nginx - Proxy Reverso

### Instalar Nginx

```bash
sudo apt install nginx
```

### Configuração do Virtual Host

Crie o arquivo `/etc/nginx/sites-available/abracanm`:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    # Logs
    access_log /var/log/nginx/abracanm_access.log;
    error_log /var/log/nginx/abracanm_error.log;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy para Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Arquivos estáticos (opcional, Next.js já serve)
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Uploads
    location /uploads {
        alias /caminho/para/abracanm/web/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

### Ativar Configuração

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/abracanm /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## SSL/HTTPS

### Instalar Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
```

### Obter Certificado

```bash
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

### Renovação Automática

```bash
# Testar renovação
sudo certbot renew --dry-run

# O certbot já configura renovação automática via cron
```

---

## Segurança

### Firewall (UFW)

```bash
# Instalar UFW
sudo apt install ufw

# Configurar regras
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Ativar
sudo ufw enable
```

### Boas Práticas

1. **JWT_SECRET**: Use uma chave de pelo menos 32 caracteres, gerada aleatoriamente
2. **Senhas do banco**: Use senhas fortes e únicas
3. **Backups**: Configure backups automáticos do banco de dados
4. **Atualizações**: Mantenha o sistema e dependências atualizados
5. **Logs**: Monitore logs regularmente para detectar problemas
6. **HTTPS**: Sempre use SSL em produção

### Verificar Segurança

```bash
# Verificar portas abertas
sudo netstat -tlnp

# Verificar processos rodando
ps aux | grep node

# Verificar logs de acesso
sudo tail -f /var/log/nginx/abracanm_access.log
```

---

## Manutenção

### Atualizar Aplicação

```bash
cd abracanm

# Parar aplicação
pm2 stop abracanm

# Atualizar código
git pull origin main

# Instalar dependências
cd web && npm install

# Atualizar banco de dados
npx prisma db push

# Rebuild
npm run build

# Reiniciar
pm2 start abracanm
```

### Monitoramento

```bash
# Status do PM2
pm2 status

# Uso de memória e CPU
pm2 monit

# Logs em tempo real
pm2 logs abracanm

# Verificar saúde do banco
psql -U abracanm -d abracanm_db -c "SELECT 1;"
```

---

## Solução de Problemas

### Erro: "JWT_SECRET não configurado"

```bash
# Verifique se a variável está definida
echo $JWT_SECRET

# Ou verifique no arquivo .env
cat .env | grep JWT_SECRET
```

### Erro: "Não foi possível conectar ao banco de dados"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U abracanm -d abracanm_db -c "SELECT 1;"

# Verificar URL no .env
cat .env | grep DATABASE_URL
```

### Erro: "EACCES permission denied"

```bash
# Corrigir permissões
sudo chown -R $USER:$USER /caminho/para/abracanm
chmod -R 755 /caminho/para/abracanm
```

### Aplicação não inicia

```bash
# Verificar logs do PM2
pm2 logs abracanm --lines 100

# Verificar se a porta está em uso
sudo lsof -i :3000

# Matar processo na porta
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Erro 502 Bad Gateway (Nginx)

```bash
# Verificar se a aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/abracanm_error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## Estrutura do Projeto

```
abracanm/
├── web/                    # Aplicação Next.js
│   ├── app/               # Páginas e rotas
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários
│   ├── prisma/            # Schema do banco
│   ├── public/            # Arquivos estáticos
│   └── uploads/           # Uploads de usuários
├── backend/               # API NestJS (legado)
├── docs/                  # Documentação
├── ecosystem.config.js    # Configuração PM2
├── .env.example          # Exemplo de variáveis
└── SETUP.md              # Este arquivo
```

---

## Suporte

- **Email**: ouvidoria@abracanm.org.br
- **Documentação**: Consulte a pasta `/docs`

---

*Última atualização: Dezembro 2024*
