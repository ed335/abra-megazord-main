# 🤖 Automações - AbraCann

Sistema de automações e webhooks integrado com n8n para notificações, workflows e integrações externas.

---

## 📋 Fluxos Principais

### 1. Email de Confirmação de Cadastro

**Trigger:** `POST /paciente/criar` (sucesso)

**Ações:**
- Enviar email para paciente
- Template: Bem-vindo à AbraCann
- Link de confirmação de email
- Duração esperada: < 1s

**Webhook Payload:**
```json
{
  "event": "paciente.cadastrado",
  "pacienteId": "uuid",
  "email": "paciente@email.com",
  "nome": "João Silva",
  "timestamp": "2025-12-10T14:30:00Z"
}
```

---

### 2. Notificação de Nova Prescrição (Paciente)

**Trigger:** `POST /prescricao/criar` (sucesso)

**Ações:**
- Enviar email ao paciente
- Notificação in-app (futura)
- Template com dados da prescrição
- Anexar PDF (se disponível)

**Webhook Payload:**
```json
{
  "event": "prescricao.emitida",
  "prescricaoId": "uuid",
  "pacienteId": "uuid",
  "pacienteEmail": "paciente@email.com",
  "pacienteNome": "João Silva",
  "prescritorNome": "Dr. Silva",
  "indicacao": "Dor Crônica",
  "validadeAte": "2026-06-10",
  "certificadoUrl": "https://...",
  "timestamp": "2025-12-10T14:30:00Z"
}
```

---

### 3. Lembrete de Prescrição Vencendo (Cron Job)

**Trigger:** Diário (02:00 UTC)

**Ações:**
- Buscar prescrições vencendo em 7 dias
- Enviar email de aviso
- Sugerir renovação

**Webhook Payload:**
```json
{
  "event": "prescricao.vencendo",
  "prescricoes": [
    {
      "prescricaoId": "uuid",
      "pacienteEmail": "paciente@email.com",
      "pacienteNome": "João Silva",
      "validadeAte": "2025-12-17",
      "diasRestantes": 7
    }
  ],
  "timestamp": "2025-12-10T02:00:00Z"
}
```

---

### 4. Recuperação de Senha

**Trigger:** `POST /auth/forgot-password`

**Ações:**
- Gerar token de reset (24h validade)
- Enviar email com link
- Template seguro

**Webhook Payload:**
```json
{
  "event": "senha.recuperacao",
  "email": "paciente@email.com",
  "nome": "João Silva",
  "resetToken": "secure-token-xyz",
  "resetLink": "https://app.abracann.com/reset?token=...",
  "expiresIn": "24h",
  "timestamp": "2025-12-10T14:30:00Z"
}
```

---

### 5. Log de Auditoria (Contínuo)

**Trigger:** Todas ações sensíveis (login, cadastro, prescrição, etc)

**Ações:**
- Registrar em DB (LogAuditoria)
- Enviar para analytics (opcional)
- Alertar se padrão suspeito

**Webhook Payload:**
```json
{
  "event": "auditoria.acao",
  "usuarioId": "uuid",
  "acao": "PRESCRICAO_CRIADA",
  "recurso": "PRESCRICAO",
  "recursoId": "uuid",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "detalhes": {
    "pacienteId": "uuid",
    "prescritorId": "uuid",
    "indicacao": "Dor Crônica"
  },
  "timestamp": "2025-12-10T14:30:00Z"
}
```

---

### 6. Requisição LGPD (Data Access / Deletion)

**Trigger:** `POST /paciente/:id/solicitar-acesso` ou `DELETE`

**Ações:**
- Gerar arquivo de exportação (JSON/CSV)
- Enviar para email paciente (7 dias)
- Registrar solicitação para compliance

**Webhook Payload:**
```json
{
  "event": "lgpd.solicitar",
  "pacienteId": "uuid",
  "email": "paciente@email.com",
  "nome": "João Silva",
  "tipo": "ACESSO",
  "dataMaximaResposta": "2025-12-17",
  "timestamp": "2025-12-10T14:30:00Z"
}
```

---

## 🔗 Endpoints de Webhook

Todos os webhooks são enviados para:

```
POST https://n8n.abracann.com/webhook/api
```

**Headers Obrigatórios:**
```
Content-Type: application/json
X-API-Key: <WEBHOOK_SECRET_KEY>
User-Agent: AbraCann-API/1.0
```

**Retry Policy:**
- Máximo 3 tentativas
- Backoff exponencial: 1s, 10s, 100s
- Timeout: 30s por requisição

---

## 📧 Templates de Email

### Confirmação de Cadastro

```
Assunto: Bem-vindo à AbraCann! 🌿

Olá [Nome],

Obrigado por confiar em nós! Seu cadastro foi criado com sucesso.

Para confirmar seu e-mail, clique no link abaixo:
[Botão: Confirmar E-mail]

Link expira em 24 horas.

Se não solicitou este cadastro, ignore este email.

Atenciosamente,
Equipe AbraCann
---
Privacidade: Seus dados são protegidos conforme a LGPD.
```

### Nova Prescrição

```
Assunto: Sua Nova Prescrição Chegou! 💊

Olá [PacienteNome],

Você recebeu uma nova prescrição do Dr. [PrescritorNome].

📋 Detalhes:
- Indicação: [Indicacao]
- Válida até: [DataValidade]
- Status: ✅ Ativa

[Botão: Acessar Cartão Digital]

Seu cartão digital está disponível na área do paciente. Você pode:
✅ Visualizar detalhes
✅ Download do PDF
✅ Compartilhar com farmácia
✅ Acessar via QR Code

Dúvidas? Envie para: suporte@abracann.com

Atenciosamente,
Equipe AbraCann
```

### Prescrição Vencendo

```
Assunto: Sua Prescrição Vence em 7 Dias ⏰

Olá [PacienteNome],

Sua prescrição emitida por Dr. [PrescritorNome] vence em:

📅 [DataVencimento] (7 dias)

Se você deseja continuar seu tratamento, entre em contato com seu prescritor para renovação.

[Botão: Ver Prescrição]

Atenciosamente,
Equipe AbraCann
```

---

## 🚨 Alertas & Monitoramento

### Alertas Automáticos

**1. Taxa de Erro Alta**
- Se falha de email > 5% em 1 hora
- Ação: Notificar #ops, pausar até resolução

**2. Prescritor Não Validado**
- Se alguém tenta emitir sem CRM ativo
- Ação: Log, notificar admin, recusar ação

**3. Tentativa de Acesso Não Autorizado**
- Múltiplas tentativas de login com erro
- Ação: Rate limiting, alerta admin, possível bloqueio

**4. Dados Suspeitos**
- CPF duplicado, email duplicado
- Ação: Requerer verificação manual

---

## 🔐 Segurança de Webhooks

### Validação

Toda requisição webhook deve ser validada:

```typescript
// Backend
import crypto from 'crypto';

function validateWebhookSignature(payload, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return computed === signature;
}
```

### Secrets

```env
# .env
WEBHOOK_SECRET_KEY=<32-character-random-string>
N8N_API_KEY=<n8n-api-key>
N8N_WEBHOOK_URL=https://n8n.abracann.com/webhook/api
```

---

## 📊 Integrações Futuras

- [ ] Integração com Zapier
- [ ] Google Sheets sync (dados públicos)
- [ ] Slack notifications
- [ ] Discord alerts
- [ ] Twilio SMS notifications
- [ ] Stripe webhooks (pagamentos)
- [ ] CRM integration (HubSpot)

---

## 🧪 Testar Webhooks Localmente

```bash
# Usar ngrok para expor localhost
ngrok http 3000

# Copiar URL
https://your-unique-id.ngrok.io

# Configurar em .env
WEBHOOK_URL=https://your-unique-id.ngrok.io/webhook

# Disparar evento de teste
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"event": "paciente.cadastrado", "pacienteId": "123"}'
```

---

## 📝 Logs & Histórico

Todos os eventos de webhook são registrados em:

```
/var/log/abracann/webhooks.log
```

Consultar histórico:
```bash
# Ver últimos 50 eventos
tail -50 /var/log/abracann/webhooks.log

# Filtrar por evento
grep "prescricao.emitida" /var/log/abracann/webhooks.log
```

---

## 🔄 Retry & Deadletter

Se um webhook falhar 3 vezes, ele vai para a fila de deadletter. Para processar:

```bash
# Ver fila de deadletter
curl https://n8n.abracann.com/api/deadletter

# Reprocessar manualmente
curl -X POST https://n8n.abracann.com/api/deadletter/:id/retry
```

---

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Status:** 🚧 Em Configuração
