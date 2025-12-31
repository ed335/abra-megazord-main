# 🔄 Como Atualizar a VPS com o Último Commit do GitHub

## 🚀 Método Rápido (Script Automático)

### Passo 1: Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .vps.env.example .vps.env

# Editar com suas credenciais reais
nano .vps.env
# ou
vim .vps.env
```

### Passo 2: Conectar à VPS
```bash
# Usar o script (recomendado)
./connect-vps.sh

# Ou conectar manualmente (substitua pelos valores do .vps.env)
ssh $VPS_USER@$VPS_IP
```

### Passo 3: Navegar até o projeto
```bash
cd ~/abra-megazord
# ou
cd /root/abra-megazord
```

### Passo 4: Copiar o script para a VPS
Você pode usar `scp` do seu computador local:
```bash
# Do seu computador local (certifique-se de ter .vps.env configurado)
# O script connect-vps.sh carrega as variáveis automaticamente
source .vps.env
scp vps-update.sh $VPS_USER@$VPS_IP:~/abra-megazord/
```

Ou criar o arquivo manualmente na VPS copiando o conteúdo do `vps-update.sh`.

### Passo 5: Executar o script
```bash
bash vps-update.sh
```

O script irá:
- ✅ Verificar mudanças locais
- ✅ Fazer pull do GitHub
- ✅ Instalar dependências se necessário
- ✅ Executar builds
- ✅ Reiniciar serviços PM2
- ✅ Verificar se tudo está funcionando

---

## 📋 Método Manual (Passo a Passo)

### 1. Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .vps.env.example .vps.env

# Editar com suas credenciais reais
nano .vps.env
```

### 2. Conectar à VPS
```bash
# Usar o script (recomendado)
./connect-vps.sh

# Ou conectar manualmente
source .vps.env
ssh $VPS_USER@$VPS_IP
```

### 3. Navegar até o projeto
```bash
cd ~/abra-megazord
```

### 3. Verificar status atual
```bash
git status
git log --oneline -5
```

### 4. Salvar mudanças locais (se houver)
```bash
# Se houver mudanças não commitadas, salve em stash
git stash save "Backup antes de atualizar - $(date +%Y-%m-%d_%H:%M:%S)"
```

### 5. Buscar atualizações
```bash
git fetch origin
```

### 6. Ver o que será atualizado
```bash
# Ver commits que serão puxados
git log HEAD..origin/main --oneline
# ou
git log HEAD..origin/master --oneline
```

### 7. Fazer pull
```bash
# Se estiver na branch main
git pull origin main

# Se estiver na branch master
git pull origin master

# Ou simplesmente (pega a branch atual)
git pull origin $(git branch --show-current)
```

### 8. Verificar se package.json mudou
```bash
# Ver arquivos modificados
git diff HEAD@{1} HEAD --name-only | grep package.json
```

### 9. Instalar dependências (se necessário)
```bash
# Se backend/package.json mudou
cd backend
npm install
cd ..

# Se web/package.json mudou
cd web
npm install
cd ..
```

### 10. Executar builds
```bash
# Build do backend
cd backend
npm run build
cd ..

# Build do frontend
cd web
npm run build
cd ..
```

### 11. Reiniciar serviços PM2
```bash
# Reiniciar todos os serviços
pm2 restart all

# Ou se preferir, parar e iniciar novamente
pm2 delete all
pm2 start ecosystem.config.js --env production
pm2 save
```

### 12. Verificar se está funcionando
```bash
# Status do PM2
pm2 status

# Ver logs
pm2 logs --lines 20

# Testar endpoints
curl http://localhost:3001
curl http://localhost:3000
```

---

## 🔍 Verificação Pós-Atualização

Execute estes comandos para garantir que tudo está funcionando:

```bash
# 1. Verificar status do PM2
pm2 status

# 2. Verificar portas
netstat -tuln | grep -E ':(3000|3001)'

# 3. Testar endpoints
curl -I http://localhost:3001
curl -I http://localhost:3000

# 4. Ver logs recentes
pm2 logs --lines 30

# 5. Verificar Nginx (se estiver usando)
sudo nginx -t
sudo systemctl status nginx
```

---

## ⚠️ Resolução de Problemas

### Erro: "Your local changes would be overwritten"
```bash
# Salvar mudanças locais
git stash save "Backup local"

# Fazer pull
git pull origin main

# Se quiser recuperar as mudanças depois
git stash pop
```

### Erro: "Merge conflict"
```bash
# Ver arquivos em conflito
git status

# Resolver conflitos manualmente ou
git merge --abort  # Para cancelar o merge

# Depois de resolver, continuar
git add .
git commit -m "Resolve merge conflicts"
```

### Erro no build
```bash
# Limpar e reinstalar
cd backend
rm -rf node_modules dist
npm install
npm run build

cd ../web
rm -rf node_modules .next
npm install
npm run build
```

### Serviços não reiniciaram
```bash
# Ver logs de erro
pm2 logs --err

# Reiniciar manualmente
pm2 restart all

# Se não funcionar, deletar e recriar
pm2 delete all
pm2 start ecosystem.config.js --env production
pm2 save
```

---

## 📝 Comandos Úteis

```bash
# Ver último commit
git log -1

# Ver diferenças entre local e remoto
git fetch origin
git log HEAD..origin/main --oneline

# Ver branch atual
git branch --show-current

# Ver mudanças não commitadas
git status

# Ver histórico de stash
git stash list

# Aplicar último stash
git stash pop

# Descartar último stash
git stash drop
```

---

## 🔄 Workflow Recomendado

1. **Desenvolvimento local** → Fazer commits e push
2. **Na VPS** → Executar `bash vps-update.sh`
3. **Verificar** → Testar se tudo está funcionando
4. **Monitorar** → Ver logs do PM2

---

## 💡 Dicas

- ✅ Sempre faça backup antes de atualizar (o script faz stash automaticamente)
- ✅ Verifique os logs após atualização
- ✅ Teste os endpoints após atualização
- ✅ Mantenha o PM2 salvo: `pm2 save`
- ✅ Use `pm2 logs` para monitorar em tempo real

---

## 🚨 Em Caso de Emergência

Se algo der errado após a atualização:

```bash
# 1. Ver último commit
git log -1

# 2. Voltar para commit anterior
git reset --hard HEAD~1

# 3. Rebuild e reiniciar
cd backend && npm run build && cd ..
cd web && npm run build && cd ..
pm2 restart all
```

Ou recuperar do stash:
```bash
# Ver stashes
git stash list

# Aplicar último stash
git stash pop
```

