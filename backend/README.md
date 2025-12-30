# 🚀 AbraCann Backend - API

API NestJS modular com arquitetura limpa (Clean Architecture + DDD) para a plataforma medicinal AbraCann.

---

## 🎯 Início Rápido

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação

```bash
# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Gere o Prisma client
npm run prisma:generate

# Execute as migrations
npm run prisma:migrate

# Inicie o servidor
npm run start:dev

# API disponível em http://localhost:3001
```

---

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── modules/                  # Domínios de negócio (modular)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   ├── dtos/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── paciente/
│   │   │   ├── paciente.controller.ts
│   │   │   ├── paciente.service.ts   # Use cases
│   │   │   ├── entities/
│   │   │   │   └── paciente.entity.ts
│   │   │   ├── dtos/
│   │   │   │   ├── criar-paciente.dto.ts
│   │   │   │   └── atualizar-paciente.dto.ts
│   │   │   ├── repositories/
│   │   │   │   └── paciente.repository.ts
│   │   │   └── paciente.module.ts
│   │   │
│   │   ├── prescritor/
│   │   │   ├── prescritor.controller.ts
│   │   │   ├── prescritor.service.ts
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   └── prescritor.module.ts
│   │   │
│   │   ├── prescricao/
│   │   │   ├── prescricao.controller.ts
│   │   │   ├── prescricao.service.ts   # Lógica de emissão
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   └── prescricao.module.ts
│   │   │
│   │   ├── educacao/
│   │   │   ├── artigo.controller.ts
│   │   │   ├── artigo.service.ts
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   └── educacao.module.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── dtos/
│   │   │   └── admin.module.ts
│   │   │
│   │   └── common/                # Módulo compartilhado
│   │       ├── guards/
│   │       ├── pipes/
│   │       ├── filters/
│   │       └── decorators/
│   │
│   ├── core/
│   │   ├── entities/              # Entidades base
│   │   ├── dtos/                  # DTOs compartilhados
│   │   ├── exceptions/            # Exceções customizadas
│   │   └── types/                 # Tipos TypeScript globais
│   │
│   ├── infra/
│   │   ├── database/
│   │   │   ├── prisma.service.ts  # PrismaService
│   │   │   └── seeds/
│   │   ├── providers/
│   │   │   ├── email.provider.ts
│   │   │   ├── pdf.provider.ts
│   │   │   ├── qrcode.provider.ts
│   │   │   ├── crypto.provider.ts
│   │   │   └── storage.provider.ts
│   │   └── config/
│   │       ├── database.config.ts
│   │       ├── jwt.config.ts
│   │       └── email.config.ts
│   │
│   ├── shared/
│   │   ├── middleware/            # CORS, logging, rate-limit
│   │   ├── filters/               # Exception filters
│   │   ├── pipes/                 # Validation pipes (Zod)
│   │   ├── decorators/            # Custom decorators (@CurrentUser, etc)
│   │   ├── interceptors/          # Response, logging interceptors
│   │   └── utils/                 # Helper functions
│   │
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Entry point
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/
│
├── test/
│   ├── unit/                      # Testes unitários (Jest)
│   ├── integration/               # Testes de integração
│   └── e2e/                       # Testes end-to-end
│
└── docker-compose.yml             # PostgreSQL local
```

---

## 🔧 Tecnologias

### Framework & Runtime
- **NestJS 10** - TypeScript framework modular
- **Node.js 18+** - JavaScript runtime
- **TypeScript** - Type safety

### Database & ORM
- **PostgreSQL 14+** - Database
- **Prisma** - ORM type-safe

### Autenticação & Segurança
- **JWT** - JSON Web Tokens
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing

### Validação & Serialização
- **Zod** - Schema validation
- **class-validator** - DTO validation

### Utilitários
- **nodemailer** - Email sending
- **date-fns** - Date manipulation

---

## 🚀 Funcionalidades Principais

### Autenticação
- ✅ Register (paciente, prescritor)
- ✅ Login com JWT
- ✅ Refresh tokens
- ✅ Logout
- ✅ Recuperação de senha
- ✅ Role-based access control (RBAC)

### Gerenciamento de Pacientes
- ✅ Criar paciente (wizard)
- ✅ Atualizar dados
- ✅ Visualizar prescrições
- ✅ Exportar dados (LGPD)
- ✅ Solicitar deleção

### Prescrições
- ✅ Emitir prescrição
- ✅ Gerar certificado PDF
- ✅ Gerar QR code
- ✅ Validação de prescrição
- ✅ Rastreamento

### Educação (CMS)
- ✅ CRUD de artigos
- ✅ Publicação de artigos
- ✅ Busca e filtro
- ✅ Markdown rendering

### Admin
- ✅ Gerenciamento de usuários
- ✅ Logs de auditoria
- ✅ Relatórios
- ✅ Compliance LGPD

---

## 🔐 Segurança

- ✅ JWT com expiration (15m access, 7d refresh)
- ✅ bcrypt com 12 rounds
- ✅ Criptografia AES-256 para PII
- ✅ HTTPS em produção
- ✅ Rate limiting (100 req/min)
- ✅ CSRF protection
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Prisma)
- ✅ Logs de auditoria
- ✅ LGPD compliance

---

## 📋 Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/abracann"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="15m"
REFRESH_TOKEN_EXPIRATION="7d"

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# API
NODE_ENV=development
API_PORT=3001
API_URL=http://localhost:3001

# Storage (opcional, para CDN)
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_S3_ACCESS_KEY=
AWS_S3_SECRET_KEY=

# n8n webhooks
N8N_WEBHOOK_URL=

# Crypto
ENCRYPTION_KEY=your-32-byte-key
```

---

## 📝 Scripts

```bash
# Desenvolvimento
npm run start:dev        # Hot reload

# Build & Production
npm run build            # Build
npm start                # Start produção

# Database
npm run prisma:generate  # Gera Prisma client
npm run prisma:migrate   # Executa migrations
npm run prisma:studio    # Abre Prisma Studio (GUI)

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier
npm test                 # Jest
npm run test:cov         # Coverage

# Docker
docker-compose up        # PostgreSQL local
```

---

## 🏗️ Arquitetura (Clean Architecture)

```
┌─────────────────────────────────────────┐
│        Controllers (REST/HTTP)          │ ← Routes
├─────────────────────────────────────────┤
│     Services (Business Logic/UseCases)  │ ← Lógica de negócio
├─────────────────────────────────────────┤
│  Repositories (Data Access/Persistence) │ ← BD abstração
├─────────────────────────────────────────┤
│     Infrastructure (Prisma, Mail, etc)  │ ← Externos
└─────────────────────────────────────────┘
```

### Princípios

1. **Modularidade**: Cada módulo é independente
2. **Injetabilidade**: Dependency Injection via NestJS
3. **Testabilidade**: Fácil de mockear e testar
4. **Escalabilidade**: Fácil adicionar novos módulos
5. **Manutenibilidade**: Código limpo e bem organizado

---

## 🔄 Fluxo de Dados

### Exemplo: Criar Paciente

```
POST /paciente
  │
  ├─→ PacienteController
  │    ├─ Validação de input (Zod)
  │    ├─ Extrai dados do request
  │    └─ Chama PacienteService
  │
  ├─→ PacienteService (Use Case)
  │    ├─ Valida regras de negócio
  │    ├─ Criptografa PII
  │    ├─ Chama PacienteRepository
  │    └─ Trigger email (n8n webhook)
  │
  ├─→ PacienteRepository
  │    ├─ Salva no Prisma
  │    └─ Retorna entidade
  │
  └─→ Response
      └─ JSON com status 201
```

---

## 📚 Documentação de API

### Autenticação

**POST /auth/register**
```typescript
{
  email: string;
  password: string;
  role: "PACIENTE" | "PRESCRITOR";
  nome: string;
  cpf?: string;
  crm?: string;
}
```

**POST /auth/login**
```typescript
{
  email: string;
  password: string;
}

// Response
{
  accessToken: string;
  refreshToken: string;
  user: { id, email, role };
}
```

### Paciente

**POST /paciente**
```typescript
{
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  condicoes: string[];
  alergias: string[];
  consenteLGPD: boolean;
}
```

**GET /paciente/:id**
- Retorna dados do paciente (autenticado)

**GET /paciente/:id/prescricoes**
- Lista prescrições do paciente

---

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e

# Watch mode
npm run test:watch
```

---

## 🐳 Docker

```bash
# Build image
docker build -t abracann-backend .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/abracann" \
  abracann-backend

# Com Docker Compose
docker-compose up
```

---

## 🚀 Deploy

### Railway / Render

1. Conecte seu repositório Git
2. Configure variáveis de ambiente
3. Deploy automático

### Manual (VPS)

```bash
npm install --production
npm run build
npm start
```

---

## 📞 Suporte

- 📧 Email: dev@abracann.com
- 💬 Slack: #backend-support
- 🔗 API Docs: http://localhost:3001/docs (Swagger futuro)

---

**Versão:** 0.1.0  
**Status:** 🚧 Em Desenvolvimento  
**Última Atualização:** Dezembro 2025
