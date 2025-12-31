# 🖥️ Comandos para VPS - Resolver Erro 502

## 🔌 Conectar à VPS

```bash
# Opção 1: Usar o script
./connect-vps.sh

# Opção 2: Conectar diretamente
ssh root@31.97.93.100
```

## 🔍 Diagnóstico Rápido

Após conectar na VPS, execute:

```bash
# Copiar o script de diagnóstico para a VPS
# (ou executar os comandos manualmente abaixo)

# 1. Verificar status do PM2
pm2 status

# 2. Ver logs do backend
pm2 logs abracann-backend --lines 50

# 3. Ver logs do frontend  
pm2 logs abracann-web --lines 50

# 4. Verificar se as portas estão abertas
netstat -tuln | grep -E ':(3000|3001)'

# 5. Verificar status do Nginx
sudo systemctl status nginx

# 6. Ver logs de erro do Nginx
sudo tail -50 /var/log/nginx/error.log
```

## 🛠️ Solução do Erro 502

### Passo 1: Verificar se os serviços estão rodando

```bash
pm2 status
```

Se não estiverem rodando, inicie:

```bash
cd /caminho/para/abra-megazord
pm2 start ecosystem.config.js --env production
pm2 save
```

### Passo 2: Verificar builds

```bash
# Backend
cd backend
npm run build
# Verificar se dist/ foi criado
ls -la dist/

# Frontend
cd ../web
npm run build
# Verificar se .next/ foi criado
ls -la .next/
```

### Passo 3: Reiniciar serviços

```bash
pm2 restart all
# ou
pm2 restart abracann-backend
pm2 restart abracann-web
```

### Passo 4: Verificar configuração do Nginx

```bash
# Testar configuração
sudo nginx -t

# Ver configuração atual
sudo cat /etc/nginx/sites-available/abracanm

# Recarregar Nginx
sudo systemctl reload nginx
```

### Passo 5: Verificar variáveis de ambiente

```bash
# Backend
cd backend
cat .env | grep -E 'API_PORT|DATABASE_URL|JWT_SECRET'

# Frontend
cd ../web
cat .env.local | grep -E 'NEXT_PUBLIC|BACKEND_URL'
```

## 🔄 Atualizar Código na VPS

```bash
# 1. Ir para o diretório do projeto
cd /caminho/para/abra-megazord

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências (se necessário)
cd backend && npm install && cd ..
cd web && npm install && cd ..

# 4. Build
cd backend && npm run build && cd ..
cd web && npm run build && cd ..

# 5. Reiniciar PM2
pm2 restart all
```

## 📋 Checklist de Verificação

- [ ] PM2 está rodando ambos os serviços?
- [ ] Backend está respondendo na porta 3001?
- [ ] Frontend está respondendo na porta 3000?
- [ ] Nginx está configurado corretamente?
- [ ] Builds foram executados com sucesso?
- [ ] Variáveis de ambiente estão configuradas?
- [ ] Banco de dados está acessível?
- [ ] Logs não mostram erros críticos?

## 🚨 Comandos de Emergência

```bash
# Parar tudo
pm2 stop all

# Deletar processos
pm2 delete all

# Reiniciar do zero
cd /caminho/para/abra-megazord
pm2 start ecosystem.config.js --env production
pm2 save

# Ver todos os logs
pm2 logs --lines 100
```

