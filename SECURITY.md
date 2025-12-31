# 🔒 Segurança - Configuração da VPS

## ⚠️ Importante: Informações Sensíveis

**NUNCA** commite informações sensíveis como:
- IPs de servidores
- Credenciais de acesso
- Senhas
- Chaves privadas
- Tokens de API

## 📋 Configuração Segura

### 1. Arquivo de Configuração

O projeto usa um arquivo `.vps.env` para armazenar informações sensíveis da VPS.

**Este arquivo NÃO é commitado no repositório** (está no `.gitignore`).

### 2. Configuração Inicial

```bash
# 1. Copiar o arquivo de exemplo
cp .vps.env.example .vps.env

# 2. Editar com suas credenciais reais
nano .vps.env
# ou
vim .vps.env
```

### 3. Variáveis Necessárias

O arquivo `.vps.env` deve conter:

```bash
# VPS IP Address
VPS_IP=your.vps.ip.address

# VPS SSH Username
VPS_USER=your_username

# VPS Project Path (opcional, tem valor padrão)
VPS_PROJECT_PATH=/home/your_username/abra-megazord
```

### 4. Localização do Arquivo

O arquivo `.vps.env` pode estar em:
- Raiz do projeto: `./.vps.env`
- Diretório home: `~/.vps.env`

Os scripts procuram em ambos os locais.

## 🛡️ Boas Práticas

1. ✅ **SEMPRE** use variáveis de ambiente para informações sensíveis
2. ✅ **NUNCA** commite arquivos `.vps.env` ou similares
3. ✅ **SEMPRE** use `.env.example` como template
4. ✅ **MANTENHA** o `.gitignore` atualizado
5. ✅ **USE** chaves SSH em vez de senhas quando possível
6. ✅ **ROTACIONE** credenciais regularmente

## 🔐 Autenticação SSH

Recomendamos usar chaves SSH em vez de senhas:

```bash
# Gerar chave SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copiar chave para a VPS
ssh-copy-id $VPS_USER@$VPS_IP

# Testar conexão sem senha
ssh $VPS_USER@$VPS_IP
```

## 📝 Checklist de Segurança

- [ ] Arquivo `.vps.env` criado e configurado
- [ ] `.vps.env` está no `.gitignore`
- [ ] Nenhuma informação sensível no código
- [ ] Chaves SSH configuradas
- [ ] Firewall configurado na VPS
- [ ] Apenas portas necessárias abertas
- [ ] Senhas fortes configuradas
- [ ] Acesso root desabilitado (se possível)
- [ ] Logs de acesso monitorados

## 🚨 Se Informações Sensíveis Foram Expostas

Se você acidentalmente commitou informações sensíveis:

1. **Imediatamente** altere as credenciais expostas
2. Remova do histórico do Git (se necessário):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .vps.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (cuidado!):
   ```bash
   git push origin --force --all
   ```
4. Considere invalidar tokens/chaves expostos

## 📚 Referências

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)

