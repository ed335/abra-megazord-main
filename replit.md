# ABRACANM - Associação Brasileira de Cannabis Medicinal

## Recent Changes (2026-01-14)
- **Complete Doctor Management System:**
  - **Admin Panel for Doctors (`/admin/medicos`):**
    - Listing with filters (Todos/Pendentes/Aprovados) and search
    - CRM approval workflow with confirmation modal
    - Stats showing total doctors and pending approvals
    - All approval/rejection actions logged for audit trail
  - **Doctor Authentication (Separate from Admin/Patient):**
    - `web/lib/medico-auth.ts` - Server-side token verification for doctors
    - `web/lib/medico-auth-client.ts` - Client-side token management
    - JWT-based authentication with CRM verification checks
    - Redirects to `/login-medico` for doctor-specific login
  - **Doctor Portal (`/medico/*`):**
    - `/medico` - Dashboard with "Meu Dia" showing today's consultations, weekly stats, and alerts
    - `/medico/agenda` - Visual weekly calendar with 7-day schedule view
    - `/medico/consultas` - Teleconsultation interface with start/end consultation flow
    - `/medico/prescricao` - Prescription issuance with ANVISA RDC 660/2022 compliance
    - `/medico/paciente/[id]` - Complete patient prontuário (medical records)
    - `/medico/pacientes` - Full patient list with search and filtering
  - **Security (LGPD Compliant):**
    - Doctor-patient relationship verified before accessing patient data
    - Prescriptions only allowed for patients with existing appointments
    - CPF masking in patient data display
    - CRM verification required for all prescription operations
  - **New APIs:**
    - `/api/admin/medicos` - List doctors with stats
    - `/api/admin/medicos/[id]/aprovar` - Approve/reject CRM
    - `/api/medico/dashboard` - Doctor daily metrics
    - `/api/medico/consultas-hoje` - Today's consultations
    - `/api/medico/prescricao` - Issue prescription
    - `/api/medico/paciente/[id]` - Get patient prontuário
  - **Audit Actions Added:** APROVAR_MEDICO, REJEITAR_MEDICO for tracking doctor CRM approvals

- **LGPD Compliance Implementation:**
  - Created `web/lib/crypto.ts` - Encryption utilities (AES-256-GCM) and data masking functions
  - Added security headers: HSTS, CSP (upgrade-insecure-requests), Permissions-Policy
  - Created `LGPD_COMPLIANCE.md` - Complete compliance documentation and production setup guide
  - Added `ENCRYPTION_KEY` environment variable for data encryption
  - Functions available: `encrypt()`, `decrypt()`, `maskCPF()`, `maskPhone()`, `maskEmail()`, `hashForAudit()`
- **Production Deployment Readiness:**
  - Created `setup.sh` - Automated install/update script for VPS deployment
  - Created `.env.example` - Complete documentation of all environment variables
  - Updated `ecosystem.config.js` - PM2 configuration for frontend (5000) and backend (3001)
  - **Security Fix:** JWT_SECRET is now mandatory (no fallback to dev secret)
  - Backend throws error on startup if JWT_SECRET is missing
  - Fixed nodemailer dependency in frontend
  - Fixed carteirinha design (removed black bar on back side)
  - All TypeScript and Prisma validation passing

## Recent Changes (2026-01-04)
- **Gamified Referral System:** Complete referral program with 5 levels and progressive rewards
  - `/indicacao` - Dashboard showing referral code, points, level, and rewards
  - 5 cannabis-themed levels: Semente (🌱), Broto (🌿), Floração (🌸), Colheita (🌳), Embaixador (🏆)
  - Level thresholds: 0, 1-2, 3-5, 6-10, 11+ referrals
  - Rewards: Progressive consultation discounts (5-20%) and free consultations for Embaixadors
  - Unique referral codes generated automatically on registration
  - `/api/indicacao` - Dashboard API with points, level, recent referrals, and rewards
  - `/api/indicacao/validar` - Validate referral codes during registration
- **WhatsApp Notifications (Evolution API):** Automated messages throughout user journey
  - Welcome message on registration with referral code
  - Pre-anamnesis completion notification
  - Referral notification when someone uses your code
  - Level-up celebration with new benefits
  - Requires EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE environment variables
- **Technical Note:** The referral processing uses Prisma transactions to ensure accurate counting and reward distribution. New paciente must be created before calling `processarIndicacao`.
- **Admin WhatsApp Messaging System:** Complete messaging interface for bulk and individual sends
  - `/admin/whatsapp` - Tabbed admin interface with Send and History views
  - Template selection: Boas-vindas, Lembrete Pré-Anamnese, Novidades, Lembrete Consulta
  - Variable substitution: {nome}, {primeiro_nome}, {cidade}, {estado}, {patologia}
  - Recipient filtering by city, state, pathology, status
  - One-click bulk send via Evolution API with confirmation dialog
  - Individual message sending for targeted communication
  - Message history with batch tracking and delivery status
  - 500ms delay between messages in bulk sends to avoid rate limiting
  - Models: MensagemWhatsApp, LoteMensagemWhatsApp for tracking
  - APIs: `/api/admin/whatsapp/enviar`, `/api/admin/whatsapp/enviar-individual`, `/api/admin/whatsapp/historico`
- **Referral Widget on Dashboard:** Compact gamification widget prominently displayed on user dashboard
  - ReferralWidget component with level emoji, name, progress bar to next level
  - Discount benefit display for current level
  - One-click copy referral code and share buttons
  - Link to full referral dashboard (`/indicacao`)
  - Added to both premium member dashboard and non-member dashboard
  - Fully responsive design with gradient amber/orange styling
  - Attention-grabbing visual design to encourage referrals

## Recent Changes (2026-01-03)
- **CRM Kanban Funnel:** Added visual Kanban board for tracking leads through the sales funnel
  - `/admin/crm` - Kanban-style CRM with 5 columns: Leads, Associados, Pré-anamnese, Consulta Agendada, Consulta Realizada
  - Stage calculation based on: onboarding completion, active subscriptions, pre-anamnese status, and consultation status
  - Cards show name, WhatsApp, location, registration date, and days in current stage
  - Filters for search and date range
  - Click-to-view modal with contact options and profile link
  - Collapsible columns for better visibility
- **Password Reset Feature:** Added forgot/reset password flow with SMTP email support
  - `/esqueci-senha` - Page to request password reset email
  - `/redefinir-senha` - Page to set new password with token validation
  - `/api/auth/forgot-password` - Generates secure token and sends email
  - `/api/auth/reset-password` - Validates token and updates password
  - Added "Esqueci minha senha" link to login page
  - Tokens expire in 1 hour for security
- **Admin Password Reset:** Admin can reset user passwords from the CRM
  - New button "Senha" in associate profile modal
  - Confirmation modal with warning and password fields
  - API endpoint `/api/admin/associados/[id]/reset-password`
  - All actions logged in audit trail
- Implemented simplified quick registration flow at `/cadastro-rapido` (4 fields only)
- Created 3-step onboarding process at `/onboarding` for profile completion
- Updated `/api/perfil` GET to return onboarding fields (jaUsaCannabis, documentoIdentidadeUrl, onboardingCompleto)
- Updated `/api/perfil` PUT to persist all onboarding fields and return completion status
- Added onboarding banner to dashboard for users with incomplete profiles
- Onboarding page now pre-fills existing data from profile API

## Overview
ABRACANM is a comprehensive platform for managing medical cannabis patients in Brazil. The system facilitates patient registration with medical documentation, appointment scheduling, payment integration via Stripe/Syncpay, video consultations, and digital prescription generation. The mission is to welcome patients seeking quality of life through cannabis medicine, breaking down barriers and taboos with science, safety, and humanity. The platform aims to be accessible to all audiences, focusing on health, quality of life, and longevity.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The project follows a modular architecture with a clear separation between frontend and backend.

**UI/UX Decisions:**
- **Design:** Minimalist design with white backgrounds, no gradients, and a clean layout.
- **Branding:** ABRACANM - Associação Brasileira de Cannabis Medicinal.
- **Communication Tone:** Welcoming, medical, and neutral.
- **Design System:** Complete component library in `web/components/ui/` with Button (6 variants), Card (7 subcomponents), Badge (7 variants), Tabs, Alert (5 variants), and Progress components - all using ABRACANM semantic colors.
- **Color Palette (ABRACANM Logo Identity):** Primary surfaces: white, gray-50, gray-100. Primary accent: #38840e (verde escuro da logo). Secondary accent: #5ca917 (verde claro da logo). Accent/highlights: #efda1d (amarelo dourado da logo). Text: gray-900, gray-600, gray-400.
- **Components:** Shared Header for consistent navigation, animated progress bars for forms, show/hide password buttons, visual validation for terms checkboxes, and smooth transition animations using Framer Motion.
- **Admin Dashboard:** Features an intuitive dashboard with statistics, graphs, search, filters, and CRUD operations, including document viewing and multi-administrator management.
- **Profile Page:** Dedicated user profile page for editing personal data with CEP auto-fill.
- **Admin Login:** Specific login page for administrators with role validation.

**Technical Implementations:**
- **Frontend:** Next.js 14 (React, Tailwind CSS, Framer Motion) for a responsive and dynamic user interface.
- **Backend:** NestJS 10 (TypeScript) for a robust and scalable API.
- **Database:** PostgreSQL with Prisma 5 ORM for data management.
- **Authentication:** JWT with Passport.js for secure user and admin authentication, including role-based access control.
- **Payment Gateway:** Integration with Syncpay for Pix payments, including webhook processing for payment confirmation and subscription activation.
- **Telemedicine:** Utilizes Agora Video SDK for secure and reliable video consultations, including virtual waiting rooms and real-time status updates.
- **Document Upload:** Secure API routes for uploading identity and medical documents.
- **CPF Validation:** Implements official Brazilian CPF validation algorithm.
- **Pre-Anamnesis System:** Generates personalized diagnoses based on patient pathology, cannabis use, symptom intensity, comorbidities, and contraindications.
- **LGPD Compliance:** Includes dedicated pages for Privacy Policy, Terms of Use, and Cookie Policy.

**Feature Specifications:**
- **Quick Registration:** Simplified signup with only 4 fields (name, email, WhatsApp, password) to reduce friction and increase conversions. Located at `/cadastro-rapido`.
- **Onboarding Flow:** 3-step progressive profile completion (CPF, address, document upload) after initial registration. Located at `/onboarding`.
- **Member Registration:** Traditional full registration flow as fallback at `/cadastro/associado`.
- **Admin Panel:** Comprehensive tools for managing associates, administrators, plans, subscriptions, and payments. Includes audit logs for administrator actions and a mass WhatsApp messaging feature with dynamic templates.
- **Pre-Anamnesis:** Optimized multi-step questionnaire leading to a personalized ABRACANM Diagnosis.
- **Appointment Scheduling:** System for managing consultations with various types, statuses, and integration with video calls.
- **Payment System:** Handles subscription plans and consultation payments, with dynamic pricing and discounts for active subscribers.
- **Teleconsultation Workflow:** Structured process for doctors and patients to engage in video consultations, from scheduling to session completion.

## External Dependencies
- **PostgreSQL:** Primary database.
- **Prisma ORM:** Database toolkit for Node.js and TypeScript.
- **Next.js:** Frontend framework.
- **NestJS:** Backend framework.
- **Tailwind CSS:** CSS framework.
- **Framer Motion:** Animation library.
- **Passport.js:** Authentication middleware for Node.js.
- **ViaCEP:** API for Brazilian ZIP code auto-completion.
- **Syncpay:** Payment gateway for Pix transactions.
- **Agora Video SDK:** For real-time video consultations.
- **Nodemailer:** SMTP email library for password reset and notifications.

## SMTP Configuration (Required for Password Reset)
Add these environment variables to enable email sending:
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM="ABRACANM" <noreply@abracanm.com>
NEXT_PUBLIC_BASE_URL=https://abracanm.com
```