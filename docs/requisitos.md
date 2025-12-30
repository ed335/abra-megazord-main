# 📋 Requisitos Funcionais e Não-Funcionais - AbraCann

## 1. Requisitos Funcionais (RF)

### 1.1 Autenticação & Autorização

**RF-1.1.1 - Registro de Usuário**
- [ ] Usuário pode se registrar como Paciente, Prescritor ou Admin
- [ ] Validação de e-mail (único, formato válido)
- [ ] Validação de CPF (único, algoritmo mod 11)
- [ ] Confirmação de e-mail via link
- [ ] Senha com requisitos mínimos (8+ caracteres, 1 maiúscula, 1 número)

**RF-1.1.2 - Login**
- [ ] Autenticação com e-mail/CPF + senha
- [ ] Geração de JWT (access token + refresh token)
- [ ] Opção "Lembrar de mim" (cookie seguro)
- [ ] Recuperação de senha por e-mail

**RF-1.1.3 - Autorização por Papel**
- [ ] Paciente: Acesso apenas a seus dados e prescrições
- [ ] Prescritor: Acesso a seus pacientes e prescrições emitidas
- [ ] Admin: Acesso total ao sistema

---

### 1.2 Gestão de Pacientes

**RF-2.1.1 - Cadastro de Paciente (Wizard)**
- [ ] Etapa 1: Dados pessoais (nome, CPF, e-mail, telefone, data nasc.)
- [ ] Etapa 2: Endereço (auto-fill via CEP, rua, número, comp., cidade, estado)
- [ ] Etapa 3: Dados médicos (condições, alergias, medicamentos)
- [ ] Etapa 4: Consentimento LGPD (checkbox com termo visível)
- [ ] Etapa 5: Confirmação e revisão
- [ ] Salvar dados com criptografia de PII

**RF-2.1.2 - Perfil do Paciente**
- [ ] Visualizar dados pessoais
- [ ] Atualizar dados (com auditoria LGPD)
- [ ] Excluir conta (direito ao esquecimento)
- [ ] Exportar dados (direito à portabilidade)
- [ ] Histórico de alterações

**RF-2.1.3 - Prescrições do Paciente**
- [ ] Listar prescrições ativas
- [ ] Listar prescrições vencidas
- [ ] Visualizar detalhes de prescrição
- [ ] Download de PDF do certificado
- [ ] Visualizar QR Code para validação
- [ ] Compartilhar prescrição (link seguro)

---

### 1.3 Gestão de Prescritores

**RF-3.1.1 - Registro de Prescritor**
- [ ] Validação de CRM
- [ ] Validação de especialidade
- [ ] Confirmação de identidade (documento)

**RF-3.1.2 - Painel do Prescritor**
- [ ] Listar pacientes cadastrados
- [ ] Buscar paciente por CPF/nome
- [ ] Visualizar histórico de prescrições emitidas

---

### 1.4 Prescrições

**RF-4.1.1 - Emissão de Prescrição**
- [ ] Prescritor seleciona paciente
- [ ] Preenche dados: indicação, dosagem, frequência, duração
- [ ] Preview da prescrição
- [ ] Assinatura digital (por JWT/PKI no futuro)
- [ ] Geração de PDF certificado
- [ ] Geração de QR Code (válido por período)
- [ ] Salvar no banco com status "ATIVA"

**RF-4.1.2 - Validação de Prescrição**
- [ ] QR Code contém ID da prescrição + hash de segurança
- [ ] Verificação online (farmácia escaneia QR)
- [ ] Retorna dados mínimos: paciente, indicação, prescritor, data válida

**RF-4.1.3 - Gerenciamento de Prescrições**
- [ ] Marcar como utilizada
- [ ] Cancelar prescrição
- [ ] Renovar prescrição
- [ ] Histórico de alterações

---

### 1.5 Módulo Educativo (CMS)

**RF-5.1.1 - Artigos**
- [ ] Admin cria/edita/publica artigos
- [ ] Conteúdo em Markdown
- [ ] Categorias (Educação, Pesquisa, Orientação, Legislação)
- [ ] Autor, data de publicação
- [ ] Slug para URL amigável

**RF-5.1.2 - Busca & Filtragem**
- [ ] Listar artigos por categoria
- [ ] Busca por texto
- [ ] Ordenação por data ou popularidade
- [ ] Paginação

**RF-5.1.3 - Visualização**
- [ ] Renderização de Markdown (títulos, listas, imagens, links)
- [ ] Compartilhar artigo
- [ ] Reação (👍/👎)
- [ ] Artigos relacionados (sugestões)

---

### 1.6 Painel Administrativo

**RF-6.1.1 - Gerenciamento de Usuários**
- [ ] Listar usuários (com paginação e filtros)
- [ ] Buscar por e-mail/CPF/CRM
- [ ] Ativar/desativar usuários
- [ ] Resetar senha
- [ ] Visualizar logs de acesso

**RF-6.1.2 - Relatórios & Estatísticas**
- [ ] Total de pacientes (ativo/inativo)
- [ ] Total de prescrições (por período)
- [ ] Prescritores mais ativos
- [ ] Taxas de conversão (cadastro → primeira prescrição)

**RF-6.1.3 - Logs de Auditoria**
- [ ] Registro de todas ações (login, cadastro, prescrição, etc)
- [ ] Filtro por usuário, ação, data, recurso
- [ ] Exportar logs em CSV

**RF-6.1.4 - Compliance**
- [ ] Requisições de acesso/exclusão LGPD
- [ ] Registrar consentimentos
- [ ] Certificados de exclusão de dados
- [ ] Relatórios de conformidade

---

### 1.7 Automações (n8n)

**RF-7.1.1 - Notificações por Email**
- [ ] Confirmação de cadastro
- [ ] Notificação de nova prescrição
- [ ] Lembrete de prescrição vencendo
- [ ] Recuperação de senha

**RF-7.1.2 - Webhooks**
- [ ] Trigger ao criar paciente
- [ ] Trigger ao emitir prescrição
- [ ] Trigger ao vencer prescrição

---

## 2. Requisitos Não-Funcionais (RNF)

### 2.1 Performance

**RNF-1.1 - Velocidade**
- [ ] Home page carrega em < 2s (Lighthouse score > 90)
- [ ] Dashboard em < 1s
- [ ] API responde em < 200ms (p95)
- [ ] Imagens otimizadas (WebP, srcset)
- [ ] Lazy loading de componentes

**RNF-1.2 - Escalabilidade**
- [ ] Suporta 10k usuários simultâneos (load testing)
- [ ] Banco de dados com índices otimizados
- [ ] Cache Redis para dados frequentes
- [ ] CDN para assets estáticos

---

### 2.2 Segurança

**RNF-2.1 - Autenticação & Autorização**
- [ ] JWT com expiration (15m access, 7d refresh)
- [ ] bcrypt com 12 rounds para senhas
- [ ] HTTPS/TLS 1.3 obrigatório
- [ ] CORS configurado (whitelist de domínios)
- [ ] Rate limiting (100 req/min por IP)

**RNF-2.2 - Proteção de Dados**
- [ ] Criptografia AES-256 para PII (CPF, endereço)
- [ ] Senhas nunca em logs
- [ ] CSRF tokens para mutações
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React escapa por padrão)

**RNF-2.3 - Auditoria**
- [ ] Log todas ações de usuário
- [ ] Timestamps e IPs
- [ ] Rastreabilidade de modificações (LGPD)
- [ ] Retenção de logs por 2 anos

---

### 2.3 Conformidade (Compliance)

**RNF-3.1 - LGPD**
- [ ] Consentimento explícito documentado
- [ ] Direito ao esquecimento (soft delete + hard delete)
- [ ] Portabilidade de dados (export em JSON/CSV)
- [ ] Notificação de vazamento em 72h
- [ ] DPO nomeado (contato informado)
- [ ] Avaliação de impacto (DPIA)

**RNF-3.2 - Regulamentações Medicinas**
- [ ] Prescritor validado (CRM)
- [ ] Auditoria de prescrições
- [ ] Certificados digitais assinados
- [ ] Conformidade com RDC 783/19 (cannabis medicinal)

---

### 2.4 Acessibilidade (WCAG 2.1)

**RNF-4.1 - Padrão AA**
- [ ] Cores com contraste >= 4.5:1 (texto)
- [ ] Suporte a leitores de tela (ARIA labels)
- [ ] Navegação por teclado (tab, Enter, Esc)
- [ ] Textos alternativos em imagens
- [ ] Tamanho de fonte mínimo 12px
- [ ] Focus visível em interativos

---

### 2.5 Usabilidade

**RNF-5.1 - Mobile-first**
- [ ] Design responsivo (mobile, tablet, desktop)
- [ ] Toque em elementos >= 44x44px
- [ ] Viewport configurado
- [ ] Performance em 3G (< 4s home)

**RNF-5.2 - Internacionalização (i18n)**
- [ ] Suporte a português (BR/PT)
- [ ] Futura expansão para espanhol, inglês
- [ ] Formato de moeda, data conforme locale

---

### 2.6 Confiabilidade

**RNF-6.1 - Uptime**
- [ ] 99.9% disponibilidade SLA
- [ ] Backup automático do BD (2x/dia)
- [ ] Replicação para disaster recovery
- [ ] Monitoring e alertas (uptime robot, datadog)

**RNF-6.2 - Recuperação**
- [ ] RTO: 1 hora
- [ ] RPO: 30 minutos
- [ ] Testes de restore regularmente

---

### 2.7 Manutenibilidade

**RNF-7.1 - Código**
- [ ] TypeScript (type safety)
- [ ] ESLint + Prettier (consistência)
- [ ] Testes unitários (Jest, cobertura > 80%)
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Documentação de código (JSDoc)

**RNF-7.2 - DevOps**
- [ ] CI/CD com GitHub Actions
- [ ] Docker para containerização
- [ ] Versionamento semântico (git tags)
- [ ] Changelogs automáticos

---

## 3. Matriz de Prioridades

| ID | Requisito | Prioridade | Impacto | Esforço |
|----|-----------|------------|---------|---------|
| RF-1.1 | Autenticação | **CRÍTICO** | Alto | Médio |
| RF-2.1 | Cadastro Paciente | **CRÍTICO** | Alto | Alto |
| RF-4.1 | Emissão Prescrição | **CRÍTICO** | Alto | Alto |
| RF-5.1 | CMS Educação | **Alto** | Médio | Médio |
| RF-6.1 | Painel Admin | **Alto** | Médio | Alto |
| RNF-2.1 | Segurança Auth | **CRÍTICO** | Alto | Médio |
| RNF-3.1 | LGPD | **CRÍTICO** | Alto | Médio |
| RNF-4.1 | Acessibilidade | **Alto** | Médio | Médio |

---

**Versão:** 1.0  
**Data:** Dezembro 2025
