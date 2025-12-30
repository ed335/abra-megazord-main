# ABRACANM - Associação Brasileira de Cannabis Medicinal

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
- **Color Palette (ClickCannabis-inspired):** Primary surfaces: white, gray-50, gray-100. Hero gradient: #E8F4F8 → #F0F9FF → white. Primary accent: #3FA174 (vibrant green). Secondary accent: #6EC1E4 (soft blue). Text: gray-900, gray-600, gray-400.
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
- **Member Registration:** A streamlined 4-step process including personal data, address (with ViaCEP auto-fill), identity document upload, and medical information.
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