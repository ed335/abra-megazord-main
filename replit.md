# ABRACANM - Associação Brasileira de Cannabis Medicinal

## Recent Changes (2026-01-22)
- **Comprehensive Onboarding System (Phases 1-10 COMPLETE):**
  - Extended Prisma schema with PerfilOnboarding, StatusOnboarding, TipoDocumento, StatusDocumento enums
  - New models: Documento (with versioning), DocumentoVersao, Carteirinha, AuditoriaDocumento, Lembrete
  - 3 user profiles: INICIANTE (ID only), PRESCRICAO (ID + prescription), ANVISA (ID + prescription + ANVISA auth)
  - State machine: LEAD → DOCS_PENDENTES → EM_VALIDACAO → ASSOCIADO_ATIVO
- **New Pages:**
  - `/associar` - 4-step wizard with profile selection, data, documents, confirmation
  - `/minha-pasta` - Document vault with upload, versioning, status tracking
  - `/minha-jornada` - User journey dashboard with next-step engine
  - `/verificar/[token]` - Public QR code verification for digital membership card
  - `/admin/documentos` - Admin panel for document review with approve/reject flow
- **APIs Created:**
  - `/api/onboarding` (GET/PUT), `/api/onboarding/documentos` (GET/POST)
  - `/api/carteirinha` (GET/POST), `/api/carteirinha/verificar/[token]` (GET)
  - `/api/admin/documentos`, `/api/admin/documentos/[id]/aprovar`, `/api/admin/documentos/[id]/rejeitar`
  - `/api/lembretes` (GET user reminders), `/api/lembretes/processar` (POST admin batch process)
- **Reminder System (Phase 8):**
  - Automated expiry alerts: prescriptions (30 days), ANVISA (60 days), contributions (7 days)
  - WhatsApp notifications via Evolution API with retry limiting (max 3 attempts)
  - Document rejection triggers automatic reminder to user
  - Helper library: `web/lib/lembretes.ts`
- **Migration Script (Phase 9):**
  - `web/scripts/migrar-usuarios-onboarding.ts` for backfilling existing users
  - Auto-classifies profile based on existing documents
  - Generates digital cards for active members
  - Run with: `npx tsx scripts/migrar-usuarios-onboarding.ts`
- **Security Improvements:**
  - Removed JWT_SECRET fallback (now throws error if not configured)
  - Document approval sets revisadoPorId/revisadoEm for audit trail
  - Profile-based document requirement validation before activating users
  - User activation requires both approved documents AND active assinatura
- **Helper Library:** `web/lib/onboarding.ts` with calcularProximoPasso(), gerarNumeroAssociado(), gerarQRToken()

## Previous Changes (2026-01-21)
- **Role-Based Access Control (RBAC) System:**
  - 6 admin roles: SUPER_ADMIN, ADMINISTRADOR, GERENTE, ATENDENTE, FINANCEIRO, MARKETING
  - 18 granular permissions across categories (Associados, Médicos, Agendamentos, Financeiro, Comunicações, Equipe, Sistema)
  - Default permissions per role + custom permission overrides
  - Helper library at `web/lib/permissions.ts` with `temPermissao()` function
- **Team Management Page (`/admin/equipe`):**
  - Full CRUD for team members
  - Filter by status (active/inactive) and role
  - Assign roles and custom permissions
  - View last access and creation date
- **Membership Card (Carteirinha) Improvements:**
  - Auto-calculated validity: 12 months from registration date
  - Auto-generated member ID in format ABR-XXXXXXXX
- **Communications Center Fixes:**
  - Added admin authentication to API routes
  - Database-based rate limiting (100 msg/hour) for multi-instance support

## Previous Changes (2026-01-15)
- **Marketplace Integration with Dashboard:**
  - "Agendar" button in dashboard now shows selection dialog
- **Doctor Marketplace:** `/marketplace` with card-based UI, search, specialty filters
- **Doctor Profile Settings:** `/medico/configuracoes` for bio, pricing, visibility
- **Test Plans Added:** 4 subscription plans (Básico, Premium, Trimestral, Anual VIP)
- **Test Doctors:** Dr. Ricardo R$350, Dr. Marcos R$450 (marketplace-visible)

## Overview
ABRACANM is a comprehensive platform for managing medical cannabis patients in Brazil. It facilitates patient registration, appointment scheduling, payment processing, video consultations, and digital prescription generation. The platform aims to provide accessible, science-backed, and humane solutions for patients seeking cannabis medicine, breaking down taboos and focusing on health, quality of life, and longevity. Key capabilities include a doctor marketplace, a gamified referral system, WhatsApp notifications, and a robust admin CRM funnel.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The project employs a modular architecture with a clear separation between frontend and backend.

**UI/UX Decisions:**
- **Design:** Minimalist design with white backgrounds, a clean layout, and consistent branding.
- **Branding:** ABRACANM - Associação Brasileira de Cannabis Medicinal, using its logo identity color palette (#38840e, #5ca917, #efda1d).
- **Communication Tone:** Welcoming, medical, and neutral.
- **Design System:** A comprehensive component library in `web/components/ui/` utilizing ABRACANM semantic colors.
- **Components:** Shared Header, animated progress bars, show/hide password, visual validation, and Framer Motion transitions.
- **Admin Dashboard:** Intuitive dashboard with statistics, graphs, search, filters, CRUD operations, document viewing, and multi-administrator management.
- **Profile Page:** Dedicated user profile page for data editing with CEP auto-fill.
- **Doctor Portal:** Dedicated portal for doctors with dashboard, agenda, teleconsultation interface, prescription issuance, and patient management.
- **Doctor Marketplace:** Public catalog of approved doctors with card-based UI, search, filtering, and detailed profiles.
- **Gamified Referral System:** Dashboard showing referral code, points, level, and rewards with a prominent dashboard widget.
- **CRM Kanban Funnel:** Visual Kanban board for tracking leads through sales stages.

**Technical Implementations:**
- **Frontend:** Next.js 14 (React, Tailwind CSS, Framer Motion) for responsiveness and dynamism.
- **Backend:** NestJS 10 (TypeScript) for robustness and scalability.
- **Database:** PostgreSQL with Prisma 5 ORM.
- **Authentication:** JWT with Passport.js for secure user, admin, and doctor authentication, including role-based access control and separate login flows.
- **Payment Gateway:** Integration with Syncpay for Pix payments, including webhook processing.
- **Telemedicine:** Agora Video SDK for secure video consultations with waiting rooms and real-time status.
- **Document Upload:** Secure API routes for identity and medical documents.
- **CPF Validation:** Implements official Brazilian CPF validation algorithm.
- **Pre-Anamnesis System:** Generates personalized diagnoses based on patient input.
- **LGPD Compliance:** Includes encryption utilities (AES-256-GCM), data masking, security headers (HSTS, CSP), and dedicated policy pages.
- **WhatsApp Notifications:** Automated messages via Evolution API for user journey milestones and admin-controlled bulk/individual sending.
- **Password Reset:** Secure forgot/reset password flow using SMTP.

**Feature Specifications:**
- **Registration & Onboarding:** Quick 4-field registration (`/cadastro-rapido`) followed by a 3-step onboarding process (`/onboarding`) for profile completion.
- **Admin Panel:** Tools for managing associates, administrators, plans, subscriptions, payments, audit logs, and mass WhatsApp messaging.
- **Doctor Management System:** Admin panel for CRM approval workflow, doctor-specific authentication, and a full doctor portal with patient records and prescription tools.
- **Appointment Scheduling:** Management of consultations with various types, statuses, and video call integration.
- **Payment System:** Subscription plans and consultation payments with dynamic pricing and discounts.
- **Teleconsultation Workflow:** Structured process for doctor-patient video sessions.
- **Referral Program:** 5-level gamified system with progressive rewards.

## External Dependencies
- **PostgreSQL:** Primary database.
- **Prisma ORM:** Database toolkit.
- **Next.js:** Frontend framework.
- **NestJS:** Backend framework.
- **Tailwind CSS:** CSS framework.
- **Framer Motion:** Animation library.
- **Passport.js:** Authentication middleware.
- **ViaCEP:** API for Brazilian ZIP code auto-completion.
- **Syncpay:** Payment gateway for Pix transactions.
- **Agora Video SDK:** For real-time video consultations.
- **Nodemailer:** SMTP email library.
- **Evolution API:** For WhatsApp messaging.