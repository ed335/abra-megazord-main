# ABRACANM - Associação Brasileira de Cannabis Medicinal

## Recent Changes (2026-01-15)
- **Marketplace Integration with Dashboard:**
  - "Agendar" button in dashboard now shows selection dialog:
    - "Consulta do Plano" → `/agendar-consulta` (for subscribers)
    - "Consulta Avulsa" → `/marketplace` (choose doctor)
  - Works for both subscribers and non-subscribers
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