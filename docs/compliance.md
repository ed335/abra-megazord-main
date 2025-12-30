# 🔐 Compliance & Segurança - AbraCann

## 1. LGPD (Lei Geral de Proteção de Dados)

### 1.1 Princípios Fundamentais

A AbraCann respeita os 10 princípios da LGPD:

1. **Finalidade**: Dados coletados apenas para fins medicais legítimos
2. **Adequação**: Proporção entre dados e objetivo
3. **Necessidade**: Só coletar dados essenciais
4. **Consentimento**: Explícito, documentado, revogável
5. **Transparência**: Usuário sabe como dados são usados
6. **Acesso**: Direito de acessar dados a qualquer momento
7. **Correção**: Direito de corrigir dados inexatos
8. **Esquecimento**: Direito ao apagamento (soft delete)
9. **Portabilidade**: Exportação em formato padrão (JSON/CSV)
10. **Não Discriminação**: Sem decisões automáticas prejudiciais

---

### 1.2 Fluxo de Consentimento

```
┌─────────────────────────────────────┐
│  Usuário acessa formulário          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Exibe termo de consentimento       │
│  (visível, não em footer escondido) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Usuário lê e marca checkbox        │
│  ☐ Declaro ter lido...              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Registro de consentimento          │
│  • Timestamp: 2025-12-10T14:30Z    │
│  • IP: 192.168.1.1                 │
│  • Versão do termo: 1.0             │
│  • Hash do termo: sha256(...)       │
│  • User Agent: Mozilla/5.0...       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Salvar no banco (log_consentimento)│
│  Dados protegidos no histórico      │
└─────────────────────────────────────┘
```

---

### 1.3 Direitos do Usuário

#### Direito de Acesso (Art. 18)
```
Usuário pode:
✅ Solicitar cópia de seus dados via portal
✅ Receber em formato estruturado (JSON/CSV)
✅ Download em até 5 dias úteis
✅ Gratuito

Implementação:
GET /user/:id/export
→ Gera ZIP com:
  - user.json
  - prescricoes.json
  - logs_auditoria.json
```

#### Direito de Correção (Art. 19)
```
Usuário pode:
✅ Corrigir dados pessoais inexatos
✅ Adicionar informações incompletas
✅ Efeito imediato

Implementação:
PATCH /user/:id
→ Log de alteração automático:
  - Campo alterado
  - Valor anterior
  - Valor novo
  - Timestamp
  - Motivo (campo)
```

#### Direito ao Esquecimento (Art. 17)
```
Usuário pode:
✅ Solicitar exclusão completa de dados
✅ Gera direito irrevogável
✅ Cascata de exclusão (prescrições, logs)

Fases:
1. Soft Delete: Marcar como deletado (reversível)
2. Período de retenção: 30 dias
3. Hard Delete: Remover do banco (irreversível)

Implementação:
DELETE /user/:id
→ Processa:
  1. Marcar user.deletado = true
  2. Agendar hard delete em 30 dias
  3. Enviar confirmação por email
  4. Log de auditoria (legal hold)
```

#### Direito à Portabilidade (Art. 20)
```
Usuário pode:
✅ Transferir dados para outro prestador
✅ Formato aberto (JSON)
✅ Gratuito e sem obstáculos

Implementação:
GET /user/:id/data-portability
→ Retorna:
  {
    "usuario": {...},
    "prescricoes": [...],
    "preferencias": {...},
    "consentimentos": [...]
  }
```

---

### 1.4 Coleta de Dados Mínima

**Dados Obrigatórios (Cadastro)**
- Nome completo
- CPF
- Email
- Telefone
- Data de nascimento
- Endereço (CEP, rua, número, cidade, estado)

**Dados Sensíveis (Saúde)** - Coleta com consentimento específico
- Condições de saúde
- Alergias
- Medicamentos em uso

**Dados que NÃO coletamos**
- ❌ Biometria (sem justificativa)
- ❌ Dados genéticos
- ❌ Dados financeiros (a menos que integração de pagamento)
- ❌ Localização contínua (apenas CEP)
- ❌ Dados de navegação (sem analytics invasivo)

---

### 1.5 Retenção de Dados

| Tipo de Dado | Período | Motivo | Exclusão |
|---|---|---|---|
| Dados de Usuário Ativo | Indefinido | Necessário para serviço | Soft delete + 30d |
| Prescrições Ativas | Conforme validade | Histórico médico | Soft delete + 7 anos |
| Prescrições Vencidas | 7 anos | Requisito legal/RDC | Hard delete automático |
| Logs de Login | 180 dias | Auditoria de segurança | Eliminação automática |
| Logs de Auditoria (geral) | 2 anos | Compliance/legal | Eliminação automática |
| Dados Deletados (soft) | 30 dias | Direito ao arrependimento | Hard delete automático |

---

### 1.6 Avaliação de Impacto (DPIA)

**Áreas de Risco Identificadas:**

1. **Dados de Saúde (Sensível)**
   - Potencial: Vazamento => discriminação, estigma
   - Mitigação: Criptografia AES-256, acesso restrito
   - Controle: Auditoria de acesso

2. **CPF/Documento**
   - Potencial: Roubo de identidade
   - Mitigação: Criptografia, validação CRM/prescritor
   - Controle: Logs de acesso, alerta ao usuário

3. **Endereço**
   - Potencial: Privacy de localização
   - Mitigação: Coleta apenas CEP de entrega (opcional)
   - Controle: Minimização de dados

4. **Rastreamento de Prescrições**
   - Potencial: Exposição de uso medicinal
   - Mitigação: Cartão digital (não físico por padrão)
   - Controle: Permissão do usuário para compartilhamento

---

### 1.7 Incidentes de Segurança (Art. 48)

**Protocolo de Notificação:**

```
Descoberta do incidente
        │
        ▼
Notificação interna imediata (CISO/DPO)
        │
        ▼
Isolamento do impacto (em < 1 hora)
        │
        ▼
Análise de risco:
  • Dados expostos?
  • Escopo (usuários afetados)?
  • Gravidade?
        │
        ▼
┌─────────────────────────────────┐
│ Risco ALTO?                      │
├─────────────────────────────────┤
│ SIM → Notificar ANPD em 72h     │
│     → Notificar usuários        │
│     → Comunicado à imprensa     │
│                                  │
│ NÃO → Log e monitoramento      │
└─────────────────────────────────┘
```

---

## 2. Segurança de Dados

### 2.1 Criptografia

**Em Repouso (At Rest)**
```
Dados sensíveis (PII) → Criptografia AES-256
  • CPF
  • Endereço completo (opcional)
  • Telefone (opcional)

Algoritmo: AES-256-GCM
Chave: Derivada com PBKDF2 (100k iterations)
IV: Gerado aleatoriamente por registro
Armazenamento: Coluna separada com prefix "enc_"

Exemplo:
user.cpf_encrypted = "enc_<base64(ciphertext)>"
```

**Em Trânsito (In Transit)**
```
Todos endpoints: HTTPS/TLS 1.3 obrigatório
  • Certificado: Let's Encrypt (auto-renovação)
  • HSTS: max-age=63072000; includeSubDomains
  • Perfect Forward Secrecy: ECDHE enabled
```

**Senhas**
```
Algoritmo: bcrypt
Salt rounds: 12
Nunca armazenar plaintext
Nunca enviar por email (apenas reset link)

Exemplo:
$2b$12$R9h7cIPz0gi.URNNGUN3..OPST9/PgBkYqs3A.AAANw8DY7VIUm2
```

---

### 2.2 Autenticação

**JWT (JSON Web Tokens)**
```
Access Token:
  • Expiration: 15 minutos
  • Payload: { sub: userId, email, role }
  • Secret: Rotacionado mensalmente
  • Claim iss: https://api.abracann.com

Refresh Token:
  • Expiration: 7 dias
  • Armazenado no banco (não em JWT)
  • Revogável (logout)
  • HttpOnly cookie (não acessível por JS)

Fluxo:
1. Login → Retorna access + refresh
2. Requisição → Header: "Authorization: Bearer <access>"
3. Expiração access → POST /auth/refresh com refresh
4. Refresh expirado → Volta para login
```

**Multi-Factor Authentication (Futuro)**
```
Planejado para:
  • Prescritors (CRM)
  • Admins (crítico)
  • Usuários sensíveis (opção)

Métodos:
  • TOTP (Google Authenticator)
  • SMS (fallback)
  • Email (fallback)
```

---

### 2.3 Autorização

**Role-Based Access Control (RBAC)**

```
Roles:
  • PACIENTE: Acesso apenas a seus dados
  • PRESCRITOR: Seus pacientes e prescrições
  • ADMIN: Acesso total + gestão do sistema

Guardas (Guards NestJS):
```

```typescript
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.PACIENTE)
@Get('paciente/:id')
async getPaciente(@Param('id') id: string) {
  // Apenas o próprio paciente acessa seus dados
  // Guard verifica: req.user.id === id
}
```

---

### 2.4 Proteção contra Ataques

| Ameaça | Mitigação | Status |
|--------|-----------|--------|
| **SQL Injection** | Prisma (parametrizado) | ✅ |
| **XSS** | React escapa automático, CSP headers | ✅ |
| **CSRF** | CSRF tokens em mutações, SameSite cookies | ✅ |
| **Brute Force** | Rate limiting (100 req/min), account lockout | ✅ |
| **DDoS** | CloudFlare/AWS Shield, rate limiting | ✅ |
| **CORS Abuse** | Whitelist de domínios, Access-Control headers | ✅ |
| **Man-in-the-Middle** | HTTPS/TLS 1.3, HSTS, CT logs | ✅ |

---

## 3. RDC 783/19 (Cannabis Medicinal)

**Conformidade com Regulamentação Brasileira**

### 3.1 Validação de Prescritor

```
Antes de emitir prescrição:
✅ Validar CRM no sistema ANVISA/CFM
✅ Verificar especialidade autorizada
✅ Confirmar registro ativo
✅ Manter histórico de validação

Frequência: 1x/mês (atualização)
Timeout: CRM inválido → acesso revogado
```

### 3.2 Auditoria de Prescrições

```
Cada prescrição gera:
  • ID único (UUID)
  • Timestamp (UTC)
  • Prescritor (CRM, nome)
  • Paciente (CPF criptografado, nome)
  • Indicação medicinal
  • Dosagem e frequência
  • Assinatura digital (hash)
  • IP de origem
  • User agent

Retenção: 7 anos (comply com RDC)
Exportação: Disponível para órgãos públicos
```

### 3.3 Certificado Digital

```
Componentes do Certificado:
  • Dados do paciente (nome, CPF parcial, data nasc)
  • Indicação medicinal (diagnóstico)
  • Dosagem recomendada
  • Período de validade
  • Prescritor (nome, CRM, assinatura)
  • Data de emissão
  • Número único de referência
  • QR Code (validação online)

Segurança:
  • Assinado digitalmente (chave privada)
  • Verificação via QR (online)
  • Impossível falsificar
  • Revogação instantânea (se cancelado)
```

### 3.4 Rastreabilidade

```
Fluxo de rastreamento:
Prescrição Emitida
    ↓
Paciente acessa (log)
    ↓
Compartilhamento com farmácia (log)
    ↓
Validação QR em farmácia (log)
    ↓
Medicação dispensada (integração futura)
    ↓
Relatório de conformidade gerado

Disponível em: /admin/rastreabilidade
```

---

## 4. Política de Privacidade & Termos

### 4.1 Documentos Obrigatórios

- ✅ **Política de Privacidade** (como dados são usados)
- ✅ **Termos de Serviço** (direitos e obrigações)
- ✅ **Termo de Consentimento LGPD** (coleta de dados sensíveis)
- ✅ **Aviso de Cookies** (rastreamento, analytics)

### 4.2 Versionamento

```
Cada documento tem:
  • Versão (1.0, 1.1, etc)
  • Data de efetividade
  • Hash para auditoria
  • Log de consentimento por versão

Mudanças exigem:
  • Aviso prévio (email)
  • Consentimento novo
  • Período de adaptação (30 dias)
```

---

## 5. DPO (Data Protection Officer)

**Nomeação & Responsabilidades**

```
Nome: [A definir]
Email: dpo@abracann.com
Telefone: [A definir]

Responsabilidades:
✅ Supervisionar conformidade LGPD
✅ Orientar organização sobre obrigações
✅ Ser ponto de contato com ANPD
✅ Investigar reclamações de privacidade
✅ Realizar auditorias periódicas
✅ Manter registros de processamento
```

---

## 6. Checklist de Conformidade

- [ ] Política de Privacidade publicada
- [ ] Termos de Serviço atualizados
- [ ] Consentimento documentado para dados sensíveis
- [ ] Criptografia AES-256 em produção
- [ ] HTTPS/TLS 1.3 em todos endpoints
- [ ] Logs de auditoria por 2 anos
- [ ] Direito de acesso/exportação implementado
- [ ] Direito de correção implementado
- [ ] Direito ao esquecimento (soft delete + hard delete)
- [ ] DPIA documentada
- [ ] DPO nomeado e contato público
- [ ] Validação CRM de prescritores
- [ ] Certificados digitais assinados
- [ ] Rastreabilidade de prescrições
- [ ] Plano de resposta a incidentes
- [ ] Testes de segurança regulares (penetration test)

---

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Próximas Atualizações:**
- [ ] Certificação de segurança (ISO 27001)
- [ ] SOC 2 Type II
- [ ] Implementação de MFA
- [ ] Integração com HL7 FHIR
