# 🏗️ Arquitetura do Sistema AbraCann

## 1. Visão Geral

AbraCann é uma plataforma medicinal digital construída com **Clean Architecture** e **Domain-Driven Design (DDD)** simplificado. O sistema é composto por três camadas principais:

```
┌─────────────────────────────────────────────────────────────┐
│                   Front-end (Next.js)                        │
│          (React Components, ShadCN/UI, Framer Motion)        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                 Back-end API (NestJS)                        │
│       (Controllers, Services, Guards, Middleware)            │
├─────────────────────────────────────────────────────────────┤
│            Domain Layer (Business Logic)                      │
│  (Use Cases, Entities, Value Objects, Repositories)         │
├─────────────────────────────────────────────────────────────┤
│         Infrastructure Layer (Data & External)               │
│  (Prisma, PostgreSQL, Auth, Email, Webhooks)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Componentes Principais

### 2.1 Front-end (Web)

**Tecnologias:**
- Next.js 14 (App Router)
- React 18+ Server Components
- TypeScript
- Tailwind CSS + ShadCN/UI
- Framer Motion
- TanStack Query (data fetching)
- Axios (HTTP client)

**Estrutura:**
```
web/
├── app/
│   ├── (auth)/                 # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── paciente/
│   │   ├── prescritor/
│   │   └── admin/
│   ├── (public)/                # Rotas públicas
│   │   ├── home/
│   │   ├── sobre/
│   │   └── contato/
│   ├── api/                     # API Routes para webhooks
│   └── layout.tsx               # Layout principal
│
├── components/
│   ├── shared/                  # Componentes reutilizáveis (ShadCN)
│   ├── forms/                   # Formulários (validados com Zod)
│   ├── layouts/                 # Layouts específicos de páginas
│   └── home/                    # Componentes da home
│
├── lib/
│   ├── api.ts                   # Configuração Axios
│   ├── auth.ts                  # Funções de autenticação
│   └── utils.ts                 # Funções utilitárias
│
├── hooks/
│   ├── useAuth.ts               # Hook de autenticação
│   ├── usePaciente.ts           # Hook de paciente
│   └── useApi.ts                # Hook de requisições
│
├── services/
│   ├── authService.ts           # Serviço de auth
│   ├── pacienteService.ts       # Serviço de paciente
│   └── prescricaoService.ts     # Serviço de prescrição
│
└── styles/
    ├── globals.css              # Estilos globais
    └── tailwind.config.ts        # Configuração Tailwind
```

### 2.2 Back-end (NestJS)

**Tecnologias:**
- NestJS (TypeScript framework)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod para validação
- Nodemailer para emails

**Estrutura (Clean Architecture + Modular):**
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controllers/       # AuthController
│   │   │   ├── services/          # AuthService (use cases)
│   │   │   ├── dtos/              # LoginDTO, RegisterDTO
│   │   │   ├── guards/            # JwtGuard, RolesGuard
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── paciente/
│   │   │   ├── controllers/       # PacienteController
│   │   │   ├── services/          # PacienteService (business logic)
│   │   │   ├── entities/          # Paciente entity
│   │   │   ├── dtos/              # CriarPacienteDTO, AtualizarPacienteDTO
│   │   │   ├── repositories/      # PacienteRepository (interface)
│   │   │   └── paciente.module.ts
│   │   │
│   │   ├── prescritor/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   └── prescritor.module.ts
│   │   │
│   │   ├── prescricao/
│   │   │   ├── controllers/
│   │   │   ├── services/          # Emissão, validação, histórico
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   └── prescricao.module.ts
│   │   │
│   │   ├── educacao/
│   │   │   ├── controllers/       # CMS básico
│   │   │   ├── services/
│   │   │   ├── entities/
│   │   │   └── educacao.module.ts
│   │   │
│   │   └── admin/
│   │       ├── controllers/
│   │       ├── services/          # Gestão de usuários, logs
│   │       └── admin.module.ts
│   │
│   ├── core/
│   │   ├── entities/              # Entidades base
│   │   ├── dtos/                  # DTOs comuns
│   │   ├── exceptions/            # Exceções customizadas
│   │   └── types/                 # Tipos TypeScript compartilhados
│   │
│   ├── infra/
│   │   ├── database/
│   │   │   ├── prisma.service.ts  # PrismaService
│   │   │   └── migrations/
│   │   ├── providers/             # Serviços externos
│   │   │   ├── email.provider.ts
│   │   │   └── pdf.provider.ts
│   │   └── config/
│   │       └── database.config.ts
│   │
│   ├── shared/
│   │   ├── middleware/            # CORS, logging, rate-limit
│   │   ├── filters/               # Exception filters
│   │   ├── pipes/                 # Validation pipes
│   │   ├── decorators/            # Custom decorators
│   │   └── utils/                 # Helper functions
│   │
│   └── app.module.ts              # Root module
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/
│
└── package.json
```

---

## 3. Fluxo de Dados

### 3.1 Autenticação & Perfis

```
Usuário → Login Form (Front) 
    ↓
POST /auth/login (Back)
    ↓
AuthService valida credenciais
    ↓
Gera JWT (access + refresh token)
    ↓
Retorna tokens + user data
    ↓
Front armazena em localStorage/cookies (secure)
    ↓
Todas requisições incluem: Authorization: Bearer <token>
    ↓
JwtGuard valida token
    ↓
Acesso autorizado conforme Role (PACIENTE, PRESCRITOR, ADMIN)
```

### 3.2 Cadastro de Paciente

```
Paciente → Clica "Novo Cadastro"
    ↓
Front exibe Wizard (5 etapas)
    ↓
Etapas:
  1. Informações Pessoais (CPF, nome, email, telefone)
  2. Endereço (LGPD - coleta consentida)
  3. Dados Médicos (condição de saúde, alergias)
  4. Consentimento LGPD (termo + checkbox)
  5. Confirmação (review + envio)
    ↓
POST /paciente/criar (Back)
    ↓
PacienteService:
  - Valida dados (Zod schema)
  - Verifica CPF único
  - Criptografa PII
  - Salva no PostgreSQL via Prisma
  - Cria log de auditoria (LGPD)
    ↓
Envia email de confirmação (n8n webhook)
    ↓
Retorna success + paciente ID
    ↓
Front redireciona para dashboard
```

### 3.3 Emissão de Prescrição

```
Prescritor → Dashboard → Nova Prescrição
    ↓
POST /prescricao/criar (Back)
    ↓
PrescricaoService:
  - Valida paciente existe
  - Valida prescritor autorizado
  - Cria entity Prescricao
  - Salva no banco
  - Gera PDF com certificado
  - Cria QR code para validação
    ↓
Trigger n8n:
  - Envia email ao paciente
  - Atualiza área do paciente em tempo real
  - Registra log de emissão (compliance)
    ↓
Retorna URL do certificado
    ↓
Paciente acessa cartão digital (front)
```

---

## 4. Banco de Dados (PostgreSQL + Prisma)

**Entities principais:**

```prisma
model Usuario {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String    // bcrypt hash
  role        Role      // PACIENTE | PRESCRITOR | ADMIN
  ativo       Boolean   @default(true)
  criadoEm    DateTime  @default(now())
  atualizadoEm DateTime @updatedAt
  
  // Relações
  paciente    Paciente?
  prescritor  Prescritor?
}

model Paciente {
  id              String    @id @default(cuid())
  usuarioId       String    @unique
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
  
  cpf             String    @unique  // criptografado
  nome            String
  email           String    @unique
  telefone        String
  dataNascimento  DateTime
  
  // LGPD
  consenteLGPD    Boolean
  consentimentoEm DateTime
  
  // Endereço
  rua             String
  numero          String
  complemento     String?
  cidade          String
  estado          String
  cep             String
  
  // Dados médicos
  condicoes       String[]  // JSON array
  alergias        String[]
  medicamentos    String[]
  
  // Prescrições
  prescricoes     Prescricao[]
  
  criadoEm        DateTime  @default(now())
  atualizadoEm    DateTime  @updatedAt
}

model Prescritor {
  id              String    @id @default(cuid())
  usuarioId       String    @unique
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
  
  crm             String    @unique
  nome            String
  especialidade   String
  instituicao     String?
  email           String    @unique
  
  prescricoes     Prescricao[]
  
  criadoEm        DateTime  @default(now())
  atualizadoEm    DateTime  @updatedAt
}

model Prescricao {
  id              String    @id @default(cuid())
  pacienteId      String
  paciente        Paciente  @relation(fields: [pacienteId], references: [id])
  
  prescritorId    String
  prescritor      Prescritor @relation(fields: [prescritorId], references: [id])
  
  descricao       String    // Indicação medicinal
  dosagem         String
  frequencia      String
  duracao         String
  
  certificadoUrl  String?   // URL do PDF
  qrCode          String?   // Código para validação
  
  status          Status    // ATIVA | VENCIDA | CANCELADA
  validadeDe      DateTime
  validadeAte     DateTime
  
  // Auditoria
  criadoEm        DateTime  @default(now())
  atualizadoEm    DateTime  @updatedAt
}

model Artigo {
  id              String    @id @default(cuid())
  titulo          String
  slug            String    @unique
  conteudo        String    // Markdown
  autor           String
  categoria       String    // EDUCACAO | PESQUISA | ORIENTACAO
  publicado       Boolean   @default(false)
  
  criadoEm        DateTime  @default(now())
  atualizadoEm    DateTime  @updatedAt
}

model LogAuditoria {
  id              String    @id @default(cuid())
  usuarioId       String?
  acao            String    // LOGIN, CADASTRO, PRESCRICAO_CRIADA, etc
  recurso         String    // PACIENTE, PRESCRICAO, etc
  recursoId       String?
  detalhes        Json?     // Dados contextuais
  
  criadoEm        DateTime  @default(now())
}
```

---

## 5. API Endpoints

### Auth
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Paciente
- `POST /paciente/criar` - Cadastro
- `GET /paciente/:id` - Obter dados
- `PATCH /paciente/:id` - Atualizar
- `GET /paciente/:id/prescricoes` - Listar prescrições

### Prescritor
- `GET /prescritor/:id` - Obter dados
- `PATCH /prescritor/:id` - Atualizar
- `GET /prescritor/:id/pacientes` - Listar pacientes

### Prescrição
- `POST /prescricao/criar` - Emitir prescrição
- `GET /prescricao/:id` - Detalhos
- `GET /prescricao/:id/pdf` - Download do certificado
- `PATCH /prescricao/:id/status` - Atualizar status

### Educação (CMS)
- `GET /artigos` - Listar artigos
- `GET /artigos/:slug` - Obter artigo
- `POST /artigos` - Criar (Admin)
- `PATCH /artigos/:id` - Editar (Admin)

### Admin
- `GET /admin/usuarios` - Listar usuários
- `GET /admin/logs` - Logs de auditoria
- `GET /admin/dashboard` - Estatísticas

---

## 6. Segurança & Autenticação

```
┌──────────────────────────────────────────────────┐
│           Camadas de Segurança                    │
├──────────────────────────────────────────────────┤
│ 1. HTTPS (TLS 1.3)                               │
│ 2. CORS (whitelist de domínios)                  │
│ 3. JWT com expiration (15m access, 7d refresh)   │
│ 4. bcrypt para senhas (salt rounds: 12)          │
│ 5. Rate limiting (100 req/min por IP)            │
│ 6. CSRF protection (tokens)                      │
│ 7. Input validation (Zod)                        │
│ 8. SQL injection protection (Prisma)             │
│ 9. Criptografia de PII (AES-256)                 │
│ 10. Logs de auditoria (todas ações)              │
└──────────────────────────────────────────────────┘
```

---

## 7. Escalabilidade & Deployment

### Local (Development)
```bash
docker-compose up  # PostgreSQL + pgAdmin
npm run dev        # Front + Back
```

### Production
```
┌────────────────────────────────────────┐
│       Front-end (Vercel)               │
│    Next.js 14 SSR + ISR               │
└────────────────────────────────────────┘
              ↓ HTTPS
┌────────────────────────────────────────┐
│      Back-end (Railway/Render)         │
│  NestJS + Node.js (scalable)          │
│  Replicas com load balancing          │
└────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────┐
│  PostgreSQL (Managed Service)          │
│  Backups automáticos 2x/dia           │
│  Replicação para DR                   │
└────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────┐
│  n8n (Automações)                      │
│  Webhooks, workflows, integrações     │
└────────────────────────────────────────┘
```

---

## 8. Próximos Passos (Roadmap)

- [ ] Pagamentos (Stripe/PagSeguro)
- [ ] Notificações push (Firebase Cloud Messaging)
- [ ] App mobile (React Native)
- [ ] Integração com sistemas de saúde (HL7 FHIR)
- [ ] BI e dashboards (Metabase)
- [ ] Suporte a múltiplos idiomas (i18n)

---

**Versão:** 1.0  
**Data:** Dezembro 2025
