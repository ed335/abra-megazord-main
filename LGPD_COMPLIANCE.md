# ABRACANM - Conformidade LGPD

## Visão Geral
Este documento descreve as medidas de proteção de dados implementadas e as configurações necessárias para conformidade com a LGPD (Lei Geral de Proteção de Dados).

## Dados Sensíveis Tratados
A plataforma ABRACANM processa os seguintes dados sensíveis:
- **Dados de saúde** (patologia, pré-anamnese, histórico médico)
- **Documentos médicos** (receitas, laudos)
- **Dados pessoais** (CPF, endereço, telefone)

## Medidas de Segurança Implementadas

### 1. Criptografia de Senhas
- Algoritmo: bcrypt com cost factor 10
- Implementado em: registro e login de usuários

### 2. Headers de Segurança HTTP
- `Strict-Transport-Security`: Força HTTPS
- `X-Content-Type-Options`: Previne MIME sniffing
- `X-Frame-Options`: Previne clickjacking
- `X-XSS-Protection`: Proteção XSS
- `Content-Security-Policy`: Upgrade para HTTPS
- `Permissions-Policy`: Controle de recursos do navegador

### 3. Autenticação JWT
- Tokens com expiração configurável (padrão: 15 minutos)
- Segredo JWT obrigatório (sem fallback)

### 4. Utilitários de Criptografia
Disponíveis em `web/lib/crypto.ts`:
- `encrypt(text)`: Criptografia AES-256-GCM
- `decrypt(text)`: Descriptografia
- `maskCPF(cpf)`: Mascaramento de CPF (ex: 123.***.***-45)
- `maskPhone(phone)`: Mascaramento de telefone
- `maskEmail(email)`: Mascaramento de email
- `hashForAudit(data)`: Hash para auditoria

## Configurações Obrigatórias para Produção

### Variáveis de Ambiente
```env
# Obrigatório - Segredo para JWT
JWT_SECRET="<gerar-com-openssl-rand-base64-32>"

# Recomendado - Chave separada para criptografia de dados
ENCRYPTION_KEY="<gerar-com-openssl-rand-base64-32>"

# Conexão segura com banco de dados (SSL)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Configuração do Servidor (Nginx/Caddy)
```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Headers adicionais
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Banco de Dados PostgreSQL
Para criptografia de dados sensíveis em repouso:
```sql
-- Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Exemplo de criptografia de coluna (opcional, para máxima segurança)
-- ALTER TABLE paciente 
-- ALTER COLUMN cpf TYPE bytea USING pgp_sym_encrypt(cpf, 'encryption-key');
```

## Auditoria e Logs

### Modelo de Auditoria
O sistema possui modelo `AuditLog` para registrar ações administrativas:
- Ação realizada
- Administrador responsável
- Detalhes da operação
- Timestamp

### Logs Recomendados
- Acesso a dados sensíveis
- Alterações de cadastro
- Downloads de documentos
- Tentativas de login

## Direitos do Titular (LGPD)

### Endpoints para Exercício de Direitos
- **Acesso**: `/api/perfil` (GET) - Visualizar dados
- **Correção**: `/api/perfil` (PUT) - Corrigir dados
- **Exclusão**: Solicitar via suporte (requer processo manual)
- **Portabilidade**: Exportar dados em formato JSON

## Checklist de Conformidade

- [x] Criptografia de senhas (bcrypt)
- [x] HTTPS obrigatório (HSTS)
- [x] Headers de segurança
- [x] JWT com expiração
- [x] Utilitários de mascaramento
- [x] Modelo de auditoria
- [ ] Criptografia de dados em repouso (configurar no PostgreSQL)
- [ ] Backup criptografado
- [ ] Política de retenção de dados
- [ ] DPO (Encarregado de Dados) designado

## Contato
Para questões sobre proteção de dados: contato@abracanm.org.br
