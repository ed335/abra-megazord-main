# 🖥️ Comandos para Executar na VPS

## 📋 Script Completo (Copiar e Colar)

### Opção 1: Usar o script automático

```bash
# 0. Configurar variáveis de ambiente (primeira vez)
cp .vps.env.example .vps.env
nano .vps.env  # Edite com suas credenciais

# 1. Conectar à VPS
./connect-vps.sh
# ou manualmente:
source .vps.env
ssh $VPS_USER@$VPS_IP

# 2. Navegar até o projeto (ajuste o caminho se necessário)
cd ~/abra-megazord
# ou use o caminho definido em VPS_PROJECT_PATH
```

# 3. Copiar o script vps-fix-502.sh para a VPS ou criar manualmente
# 4. Executar o script
bash vps-fix-502.sh
```

### Opção 2: Executar comandos manualmente

```bash
# ==========================================
# 1. NAVEGAR ATÉ O PROJETO
# ==========================================
cd ~/abra-megazord
# ou o caminho onde está seu projeto

# ==========================================
# 2. VERIFICAR STATUS ATUAL
# ==========================================
pm2 status

# ==========================================
# 3. VERIFICAR SE OS BUILDS EXISTEM
# ==========================================
ls -la backend/dist/
ls -la web/.next/

# ==========================================
# 4. INSTALAR DEPENDÊNCIAS (se necessário)
# ==========================================
cd backend && npm install && cd ..
cd web && npm install && cd ..

# ==========================================
# 5. EXECUTAR BUILDS
# ==========================================
cd backend
npm run build
cd ..

cd web
npm run build
cd ..

# ==========================================
# 6. PARAR PROCESSOS PM2 EXISTENTES
# ==========================================
pm2 delete all

# ==========================================
# 7. INICIAR SERVIÇOS COM PM2
# ==========================================
pm2 start ecosystem.config.js --env production
pm2 save

# ==========================================
# 8. VERIFICAR STATUS
# ==========================================
pm2 status
pm2 logs --lines 20

# ==========================================
# 9. VERIFICAR PORTAS
# ==========================================
netstat -tuln | grep -E ':(3000|3001)'
# ou
ss -tuln | grep -E ':(3000|3001)'

# ==========================================
# 10. TESTAR ENDPOINTS
# ==========================================
curl http://localhost:3001
curl http://localhost:3000

# ==========================================
# 11. VERIFICAR NGINX
# ==========================================
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx

# ==========================================
# 12. VER LOGS DO NGINX
# ==========================================
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/access.log
```

## 🔍 Diagnóstico Rápido

```bash
# Ver status do PM2
pm2 status

# Ver logs do backend
pm2 logs abracann-backend --lines 50

# Ver logs do frontend
pm2 logs abracann-web --lines 50

# Ver todos os logs
pm2 logs --lines 100

# Verificar processos Node
ps aux | grep node

# Verificar uso de memória
free -h

# Verificar espaço em disco
df -h
```

## 🛠️ Comandos de Correção Específicos

### Se o backend não está rodando:

```bash
cd ~/abra-megazord/backend
npm run build
pm2 start ecosystem.config.js --only abracann-backend --env production
pm2 save
```

### Se o frontend não está rodando:

```bash
cd ~/abra-megazord/web
npm run build
pm2 start ecosystem.config.js --only abracann-web --env production
pm2 save
```

### Se ambos não estão rodando:

```bash
cd ~/abra-megazord
pm2 delete all
pm2 start ecosystem.config.js --env production
pm2 save
```

### Se há erro de build:

```bash
# Backend
cd ~/abra-megazord/backend
rm -rf dist node_modules
npm install
npm run build

# Frontend
cd ~/abra-megazord/web
rm -rf .next node_modules
npm install
npm run build
```

## 🔄 Atualizar Código na VPS

```bash
# 1. Ir para o projeto
cd ~/abra-megazord

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências
cd backend && npm install && cd ..
cd web && npm install && cd ..

# 4. Build
cd backend && npm run build && cd ..
cd web && npm run build && cd ..

# 5. Reiniciar PM2
pm2 restart all
```

## 🚨 Comandos de Emergência

```bash
# Parar tudo
pm2 stop all

# Deletar tudo e recomeçar
pm2 delete all
cd ~/abra-megazord
pm2 start ecosystem.config.js --env production
pm2 save

# Ver logs em tempo real
pm2 logs

# Monitorar recursos
pm2 monit

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 📝 Verificar Variáveis de Ambiente

```bash
# Backend
cd ~/abra-megazord/backend
cat .env | grep -E 'DATABASE_URL|JWT_SECRET|API_PORT'

# Frontend
cd ~/abra-megazord/web
cat .env.local | grep -E 'NEXT_PUBLIC|BACKEND_URL'
```

## ✅ Checklist de Verificação

Execute estes comandos para verificar se tudo está funcionando:

```bash
# 1. PM2 está rodando?
pm2 status

# 2. Portas estão abertas?
netstat -tuln | grep -E ':(3000|3001)'

# 3. Serviços respondem?
curl -I http://localhost:3001
curl -I http://localhost:3000

# 4. Nginx está configurado?
sudo nginx -t
sudo systemctl status nginx

# 5. Logs não mostram erros?
pm2 logs --lines 20 --err
```

## 🔗 Links Úteis

- PM2 Docs: https://pm2.keymetrics.io/
- Nginx Docs: https://nginx.org/en/docs/

