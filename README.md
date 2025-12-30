# 🌿 AbraCann - Plataforma Medicinal Digital

**Missão:** Democratizar o acesso a medicamentos derivados da cannabis com segurança, ciência e acolhimento.

---

## 🎯 Pilares do Projeto

- **Acolhimento**: UI/UX humanizada, acessível e inclusiva
- **Qualidade**: Arquitetura limpa, código modular e testável
- **Segurança**: LGPD compliance, autenticação robusta, dados criptografados
- **Ciência**: Integração com pesquisas, educação baseada em evidências

---

## 🏗️ Visão do Produto Digital

AbraCann é uma plataforma web completa que integra:

1. **Portal do Paciente**: Cadastro, consulta de prescrições, cartão digital medicinal
2. **Área do Prescritor**: Gerenciamento de pacientes, emissão de prescrições
3. **Módulo Educativo**: Artigos, pesquisas, orientações para pacientes
4. **Painel Administrativo**: Gestão de usuários, compliance, relatórios
5. **Módulo de Benefícios**: Isenção fiscal, programas de assistência social
6. **Sistema de Automação**: Workflows com n8n para notificações e integrações

---

## 📁 Estrutura da Workspace

```
abracann/
│
├── docs/                          # Documentação técnica e de negócio
│   ├── arquitetura.md            # Design do sistema, componentes, fluxo de dados
│   ├── fluxos.md                 # Fluxos de usuário (onboarding, cadastro, prescrição)
│   ├── requisitos.md             # Requisitos funcionais e não-funcionais
│   ├── uiux.md                   # Guia de UI/UX, paleta, tipografia, componentes
│   └── compliance.md             # LGPD, segurança, regulamentações medicinas
│
├── web/                           # Front-end (Next.js 14 + React)
│   ├── app/                      # App Router (Next.js 13+)
│   ├── components/               # Componentes React (ShadCN, custom)
│   ├── lib/                      # Utilitários, helpers, types
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # Client services (API calls, auth)
│   ├── styles/                   # Global styles, Tailwind config
│   ├── public/                   # Assets estáticos
│   └── README.md                 # Setup e instruções do front-end
│
├── backend/                       # Back-end (Node.js modular)
│   ├── src/
│   │   ├── modules/              # Módulos de negócio (pacientes, prescritores, etc)
│   │   ├── core/                 # Entidades, DTOs, interfaces
│   │   ├── infra/                # Database, adapters, integrations
│   │   └── shared/               # Guards, middleware, utilities
│   ├── prisma/                   # Schema PostgreSQL
│   └── README.md                 # Setup e instruções do backend
│
├── automations/                   # Workflows e automações
│   ├── n8n-fluxos/               # JSONs dos fluxos n8n
│   └── webhooks.md               # Documentação de webhooks
│
├── design-system/                 # Design System (tokens, componentes, guia)
│   ├── tokens/                   # Cores, tipografia, espaçamento
│   ├── components/               # Componentes reutilizáveis documentados
│   └── README.md                 # Guia do design system
│
└── README.md                      # Este arquivo
```

---

## 🚀 Stack Tecnológico

### Front-end
- **Next.js 14** com React Server Components
- **TypeScript** para type safety
- **Tailwind CSS** + **ShadCN/UI** para componentes estilizados
- **Radix UI** para primitivos acessíveis
- **Framer Motion** para animações suaves
- **React Hook Form** + **Zod** para validação de formulários
- **Axios/TanStack Query** para requisições HTTP

### Back-end
- **Node.js** com **NestJS** (arquitetura modular)
- **Prisma ORM** para migrations e queries type-safe
- **PostgreSQL** como banco de dados principal
- **JWT** para autenticação
- **Zod/Joi** para validação de schemas
- **Stripe/PagSeguro** para pagamentos (integração futura)

### DevOps & Infra
- **Docker** para containerização
- **Docker Compose** para ambiente local
- **GitHub Actions** para CI/CD
- **n8n** para automações e integrações
- **Vercel** para deploy do front-end
- **Railway/Render** para deploy do back-end

---

## 📚 Módulos Iniciais

1. **Autenticação & Perfis** (Paciente, Prescritor, Admin)
2. **Cadastro de Pacientes** com validações LGPD
3. **Gestão de Prescrições** (emissão, consulta, histórico)
4. **Cartão Digital Medicinal** (PDF, QR Code)
5. **Área de Educação** (CMS básico para artigos)
6. **Painel Administrativo** (usuários, logs, relatórios)

---

## 🎨 Estética & UI/UX

**Cores Principais:**
- Off-White: `#FAFAF8`
- Verde Oliva: `#6B7C59`
- Acentos Dourados: `#D4A574`
- Neutros: Cinza suave para textos

**Tipografia:**
- Sans-serif clean (Inter, Geist)
- Acessível (WCAG AA+)
- Scales responsivas

**Componentes:**
- Botões com hover suave
- Cards com sombras sutis
- Navegação com transições fade
- Formulários intuitivos com feedback visual

**Animações Framer Motion:**
- Fade-in na home
- Slide em seções
- Scale em CTAs
- Stagger para listas

---

## 🏁 Getting Started

### Pré-requisitos
- Node.js 18+
- npm/yarn/pnpm
- Git
- PostgreSQL (local ou container Docker)

### Instalação Rápida

```bash
# Clone o repositório
git clone <repo-url>
cd abracann

# Instale dependências do web
cd web
npm install

# Instale dependências do backend
cd ../backend
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Rode as migrations do banco
npx prisma migrate dev

# Inicie o projeto
npm run dev
```

---

## 📋 Documentação

- **[Arquitetura](./docs/arquitetura.md)** - Design do sistema, componentes, fluxo de dados
- **[Fluxos de Usuário](./docs/fluxos.md)** - Onboarding, cadastro, prescrição, educação
- **[Requisitos](./docs/requisitos.md)** - Specs funcionais e não-funcionais
- **[UI/UX Guide](./docs/uiux.md)** - Paleta, tipografia, componentes, animações
- **[Compliance](./docs/compliance.md)** - LGPD, segurança, regulamentações

---

## 🔐 Segurança & Compliance

- ✅ LGPD compliance (consentimento, direito ao esquecimento, portabilidade)
- ✅ Criptografia de dados sensíveis (PII)
- ✅ JWT com refresh tokens
- ✅ Rate limiting e proteção CSRF
- ✅ Logs de auditoria
- ✅ Validação de dados robusta
- ✅ HTTPS obrigatório

---

## 👥 Contribuindo

Este é um projeto colaborativo. Siga as convenções:

1. **Branches**: `feature/nome`, `bugfix/nome`, `docs/nome`
2. **Commits**: Mensagens descritivas em português
3. **Code Style**: Prettier + ESLint
4. **Tests**: Jest para testes unitários

---

## 📞 Contato & Suporte

- 📧 Email: contato@abracann.com
- 🔗 Website: www.abracann.com
- 🐛 Issues: GitHub Issues

---

**Última atualização:** Dezembro 2025  
**Status:** 🚀 Em Desenvolvimento
