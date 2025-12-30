#!/bin/bash

# 🎯 Script para visualizar a estrutura da workspace AbraCann
# Use: bash view-structure.sh

echo "================================"
echo "🌿 ABRACANN - WORKSPACE ESTRUTURA"
echo "================================"
echo ""

echo "📊 Estatísticas:"
echo "=================="
echo ""
echo "📁 Diretórios criados:"
find . -maxdepth 3 -type d | grep -v node_modules | grep -v ".git" | wc -l
echo ""

echo "📄 Arquivos criados:"
find . -maxdepth 4 \( -name "*.md" -o -name "*.json" -o -name "*.tsx" -o -name "*.ts" -o -name "*.css" -o -name "*.prisma" -o -name "*.yml" \) | grep -v node_modules | wc -l
echo ""

echo "📋 Arquivos por categoria:"
echo ""
echo "  Documentação (.md):"
find . -name "*.md" | grep -v node_modules | wc -l
echo ""

echo "  Configuração (.json, .ts config):"
find . -type f \( -name "*.json" -o -name "*config*.ts" \) | grep -v node_modules | wc -l
echo ""

echo "  Componentes React (.tsx):"
find . -name "*.tsx" | wc -l
echo ""

echo "  Database Schema (.prisma):"
find . -name "*.prisma" | wc -l
echo ""

echo "  Estilos (.css):"
find . -name "*.css" | wc -l
echo ""

echo "================================"
echo "📁 ESTRUTURA DE DIRETÓRIOS"
echo "================================"
echo ""

tree -L 3 -I 'node_modules|.git' --charset ascii << 'EOF'
abracann-megazord/
|
+-- README.md (Visão do projeto)
+-- SETUP.md (Guia de setup)
+-- CONTRIBUTING.md (Como contribuir)
+-- ARQUIVOS.md (Este sumário)
+-- .gitignore
+-- docker-compose.yml (PostgreSQL + pgAdmin + MailHog)
|
+-- docs/
|   +-- arquitetura.md (Design do sistema)
|   +-- fluxos.md (Fluxos de usuário)
|   +-- requisitos.md (Specs)
|   +-- uiux.md (Guia de design)
|   +-- compliance.md (LGPD & Segurança)
|
+-- web/ (Front-end Next.js)
|   +-- package.json
|   +-- tsconfig.json
|   +-- next.config.ts
|   +-- tailwind.config.ts
|   +-- .eslintrc.json
|   +-- .prettierrc.json
|   +-- .env.example
|   +-- README.md
|   |
|   +-- app/
|   |   +-- layout.tsx (Root layout)
|   |   +-- page.tsx (Home)
|   |   +-- globals.css (Estilos globais)
|   |
|   +-- components/
|   |   +-- home/
|   |   |   +-- HeroSection.tsx
|   |   |   +-- FeaturesSection.tsx
|   |   |   +-- HowItWorksSection.tsx
|   |   |   +-- CTASection.tsx
|   |   +-- shared/
|   |       +-- Button.tsx
|   |       +-- Footer.tsx
|   |
|   +-- lib/ (Placeholder)
|   +-- hooks/ (Placeholder)
|   +-- services/ (Placeholder)
|   +-- types/ (Placeholder)
|   +-- public/
|
+-- backend/ (Back-end NestJS)
|   +-- package.json
|   +-- .env.example
|   +-- README.md
|   |
|   +-- prisma/
|   |   +-- schema.prisma (11 models DB)
|   |
|   +-- src/ (Estrutura planejada)
|   |   +-- modules/ (Auth, Paciente, Prescritor, Prescricao, etc)
|   |   +-- core/ (Entities, DTOs, Exceptions)
|   |   +-- infra/ (Database, Providers)
|   |   +-- shared/ (Middleware, Pipes, Guards)
|
+-- design-system/
|   +-- README.md (Guia de design)
|   +-- tokens/ (Placeholder)
|   +-- components/ (Placeholder)
|
+-- automations/
|   +-- webhooks.md (6 fluxos de webhooks)
|   +-- n8n-fluxos/ (Placeholder)
EOF

echo ""
echo "================================"
echo "✅ RESUMO DE CRIAÇÃO"
echo "================================"
echo ""

echo "✅ Estrutura de pastas - COMPLETA"
echo "✅ Documentação - COMPLETA (5 arquivos)"
echo "✅ Front-end Next.js - PRONTO PARA USAR"
echo "✅ Back-end NestJS - ESTRUTURA + SCHEMA"
echo "✅ Design System - DEFINIDO"
echo "✅ Automações (n8n) - PLANEJADO"
echo "✅ Docker Compose - PRONTO"
echo "✅ Configurações - COMPLETAS"
echo ""

echo "================================"
echo "🚀 PRÓXIMOS PASSOS"
echo "================================"
echo ""

echo "1️⃣  Leia o SETUP.md"
echo "   $ cat SETUP.md"
echo ""

echo "2️⃣  Inicie o Docker"
echo "   $ docker-compose up -d"
echo ""

echo "3️⃣  Instale dependências"
echo "   $ cd backend && npm install"
echo "   $ cd ../web && npm install"
echo ""

echo "4️⃣  Inicie o desenvolvimento"
echo "   Terminal 1: cd backend && npm run start:dev"
echo "   Terminal 2: cd web && npm run dev"
echo ""

echo "5️⃣  Acesse a aplicação"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3001"
echo "   pgAdmin: http://localhost:5050"
echo ""

echo "================================"
echo "📚 DOCUMENTAÇÃO IMPORTANTE"
echo "================================"
echo ""

echo "📖 Ler nesta ordem:"
echo "  1. README.md - Visão geral"
echo "  2. SETUP.md - Como configurar"
echo "  3. docs/arquitetura.md - Design técnico"
echo "  4. docs/uiux.md - Componentes e padrões"
echo "  5. design-system/README.md - Design tokens"
echo ""

echo "================================"
echo "✨ WORKSPACE PRONTA!"
echo "================================"
echo ""
