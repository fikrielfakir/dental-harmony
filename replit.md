# DentalCare Practice Management System

## Overview

This is a comprehensive dental practice management system built with React, TypeScript, and modern web technologies. The application streamlines patient management, appointment scheduling, clinical records, billing, prescriptions, staff management, and reporting for dental practices.

The system provides a complete solution for dental offices to manage their day-to-day operations including patient registration, appointment booking, treatment tracking, invoicing, and financial reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 18+ with TypeScript**: The application uses React with TypeScript for type-safe component development
- **Vite**: Build tool and development server for fast HMR and optimized production builds
- **Single Page Application**: Client-side routing with React Router DOM

### State Management
- **Zustand with Persistence**: Global state management using Zustand store with localStorage persistence for data like patients, appointments, staff, invoices, and clinical notes

### UI Component Architecture
- **Shadcn/ui**: Pre-built accessible component library based on Radix UI primitives
- **TailwindCSS**: Utility-first CSS framework with custom design tokens (Windows 11 inspired palette)
- **Class Variance Authority (CVA)**: Component variant management for consistent styling

### Data Layer
- **Local State Only**: Currently uses in-memory state with mock data - no backend database connected yet
- **Mock Data Generation**: Sample data for patients, staff, and appointments in `/src/data/mockData.ts`
- **Type Definitions**: Comprehensive TypeScript types for all entities in `/src/types/index.ts`

### Core Modules
1. **Patient Management**: Registration, medical history, allergies, medications tracking
2. **Appointment Scheduling**: Weekly calendar view with time slots, status management
3. **Clinical Records**: Treatment notes, procedure documentation
4. **Billing**: Invoices, payments, quotations with CRUD operations
5. **Prescriptions**: Medication tracking (view-only currently)
6. **Staff Management**: Role-based staff listing (dentist, hygienist, assistant, receptionist, admin)
7. **Reports**: Revenue charts, procedure distribution analytics
8. **Settings**: Practice configuration panels

### Design Patterns
- **Component Composition**: Reusable UI components in `/src/components/ui/`
- **Feature-based Pages**: Each module has its own page component in `/src/pages/`
- **Centralized Store**: Single Zustand store managing all application state
- **Layout System**: Shared MainLayout with AppHeader for consistent navigation

## External Dependencies

### UI Libraries
- **Radix UI**: Complete set of accessible primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Charting library for revenue and procedure analytics
- **Embla Carousel**: Carousel component for carousels
- **React Day Picker**: Date selection component
- **CMDK**: Command palette component

### Form & Validation
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **Zod**: Schema validation (available but not heavily used yet)

### Data Fetching
- **TanStack React Query**: Async state management (configured but minimal usage with current local-only data)

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx + tailwind-merge**: Class name composition utilities
- **Vaul**: Drawer component for mobile interfaces

### Development Tools
- **Vitest**: Test runner with jsdom environment
- **ESLint**: Code linting with TypeScript and React plugins
- **TypeScript**: Strict type checking (relaxed settings for flexibility)

### Future Database Integration
The application is designed to integrate with Supabase (PostgreSQL) based on the project requirements. The type definitions and store structure support:
- Patient records with medical history
- Appointment scheduling with practitioner assignments
- Invoice and payment tracking
- Insurance claims management
- Service catalog with pricing