# 🌿 AbraCann Web - Front-end

Aplicação Next.js 14 com React Server Components, Tailwind CSS e Framer Motion para a plataforma medicinal AbraCann.

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Abra http://localhost:3000 no navegador
```

---

## 📁 Estrutura do Projeto

```
web/
├── app/                          # App Router (Next.js 14)
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Home
│   ├── globals.css              # Estilos globais
│   ├── (auth)/                  # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── paciente/
│   │   └── prescritor/
│   └── api/                     # API routes
│
├── components/
│   ├── home/                    # Componentes da home
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   └── CTASection.tsx
│   ├── forms/                   # Formulários
│   │   ├── CadastroPaciente.tsx
│   │   ├── LoginForm.tsx
│   │   └── RecuperacaoSenha.tsx
│   ├── shared/                  # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   └── layouts/                 # Layouts específicos
│       ├── AuthLayout.tsx
│       └── DashboardLayout.tsx
│
├── lib/
│   ├── api.ts                  # Configuração Axios
│   ├── auth.ts                 # Funções de autenticação
│   ├── utils.ts                # Utilitários gerais
│   └── validators.ts           # Schemas Zod
│
├── hooks/
│   ├── useAuth.ts              # Hook de autenticação
│   ├── useApi.ts               # Hook para requisições
│   └── usePaciente.ts          # Hook de paciente
│
├── services/
│   ├── authService.ts          # Serviço de auth
│   ├── pacienteService.ts      # Serviço de paciente
│   ├── prescricaoService.ts    # Serviço de prescrição
│   └── educacaoService.ts      # Serviço de educação
│
├── types/
│   ├── index.ts                # Types globais
│   ├── auth.ts                 # Types de auth
│   └── api.ts                  # Types de API
│
└── public/
    ├── images/
    └── icons/
```

---

## 🎨 Tecnologias

### Framework & Linguagem
- **Next.js 14** - React framework com App Router
- **TypeScript** - Type safety

### Estilo & Componentes
- **Tailwind CSS** - Utility-first CSS
- **ShadCN/UI** - Componentes acessíveis
- **Framer Motion** - Animações suaves

### Formulários & Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Requisições HTTP
- **Axios** - HTTP client

### Utilitários
- **date-fns** - Manipulação de datas
- **lucide-react** - Ícones

---

## 🎯 Funcionalidades Principais

### Home
- ✅ Hero section com Framer Motion
- ✅ Seção de features com cards
- ✅ Seção "Como Funciona"
- ✅ CTA (Call To Action)
- ✅ Footer completo

### Autenticação
- 🔄 Login/Register
- 🔄 Recuperação de senha
- 🔄 JWT token management
- 🔄 Persistência de sessão

### Dashboard Paciente
- 🔄 Visualizar prescrições
- 🔄 Download de certificados
- 🔄 Perfil e configurações
- 🔄 Histórico de atividades

### Cadastro de Paciente (Wizard)
- 🔄 Etapa 1: Dados pessoais
- 🔄 Etapa 2: Endereço (com auto-fill via CEP)
- 🔄 Etapa 3: Dados médicos
- 🔄 Etapa 4: Consentimento LGPD
- 🔄 Etapa 5: Confirmação

### Educação (CMS)
- 🔄 Listagem de artigos
- 🔄 Filtro por categoria
- 🔄 Busca
- 🔄 Visualização de artigo completo

---

## 🔐 Segurança

- ✅ HTTPS obrigatório em produção
- ✅ JWT com expiration (15m)
- ✅ Refresh tokens (7d)
- ✅ HttpOnly cookies para tokens
- ✅ CSRF protection
- ✅ Validação de input (Zod)
- ✅ Sanitização de HTML (XSS prevention)

---

## 🌍 Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Auth
NEXT_PUBLIC_AUTH_DOMAIN=abracann.com

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel

# Produção
vercel --prod
```

### Docker

```bash
# Build
docker build -t abracann-web .

# Run
docker run -p 3000:3000 abracann-web
```

---

## 📝 Scripts

```bash
# Desenvolvimento
npm run dev                # Inicia servidor dev

# Build
npm run build             # Build para produção
npm start                 # Inicia servidor de produção

# Qualidade de Código
npm run lint              # ESLint
npm run format            # Prettier
npm run type-check        # TypeScript check

# Testing (futuro)
npm run test              # Jest
npm run test:e2e          # Cypress
```

---

## 🎨 Design System

Consulte `/design-system/README.md` para:
- Paleta de cores
- Tipografia
- Componentes reutilizáveis
- Guia de animações
- Padrões de acessibilidade

---

## 🔄 Estado da Aplicação

### Contextos e Hooks

```typescript
// useAuth.ts - Gerencia autenticação
const { user, login, logout, isLoading } = useAuth();

// useApi.ts - Wrapper Axios com interceptadores
const { data, error, loading } = useApi('/endpoint');

// usePaciente.ts - Dados do paciente logado
const { paciente, setPaciente } = usePaciente();
```

---

## 📚 Documentação

- **[Arquitetura](../docs/arquitetura.md)** - Visão técnica do sistema
- **[Fluxos](../docs/fluxos.md)** - User flows detalhados
- **[UI/UX](../docs/uiux.md)** - Guia de design
- **[Requisitos](../docs/requisitos.md)** - Specs funcionais

---

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

**Linter & Formatter:**
```bash
npm run format    # Prettier
npm run lint      # ESLint
```

---

## 🐛 Reportar Issues

Encontrou um bug? Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots/videos (se aplicável)

---

## 📞 Suporte

- 📧 Email: dev@abracann.com
- 💬 Slack: #frontend-support
- 🔗 Docs: https://docs.abracann.com

---

**Versão:** 0.1.0  
**Status:** 🚧 Em Desenvolvimento  
**Última Atualização:** Dezembro 2025
