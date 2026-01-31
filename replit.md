# IAHub - Institutional Advancement Dashboard

## Overview

IAHub is an illustrative, synthetic-data dashboard designed to support Institutional Advancement strategy. It provides visualization and management tools for Advancement Services leadership to monitor donor engagement, pipeline visibility, and data quality metrics. The application uses synthetic data only and is explicitly a conceptual demonstration tool, not connected to live CRM systems.

The system is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom plugins for Replit integration
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Charts**: Recharts for data visualization (bar charts, pie charts)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with tsx for development, esbuild for production)
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Authentication**: Cookie-based sessions with in-memory session storage
- **Role-Based Access**: Four user roles (admin, president, vice_president, staff)

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command
- **Tables**: 
  - `due_items` - Countdown timer items with deadlines
  - `messages` - Team communication messages
  - `action_items` - Strategic action tracking with impact/priority
  - `donors` - Donor pipeline data

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Custom build script that bundles server with esbuild and client with Vite
- **Output**: `dist/` directory with `index.cjs` (server) and `public/` (client assets)

### Authentication Flow
- Simple username/password authentication against hardcoded user list
- Session ID stored in HTTP-only cookie
- `/api/auth/check` endpoint for session validation
- Protected routes redirect to login when unauthenticated

## External Dependencies

### Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database queries and schema management
- **connect-pg-simple**: PostgreSQL session store (available but not currently used)

### UI Libraries
- **Radix UI**: Complete set of accessible UI primitives (dialogs, dropdowns, tabs, etc.)
- **Recharts**: Chart visualizations
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant styling

### Development Tools
- **Replit Plugins**: 
  - `@replit/vite-plugin-runtime-error-modal` - Error overlay
  - `@replit/vite-plugin-cartographer` - Dev tooling (dev only)
  - `@replit/vite-plugin-dev-banner` - Development banner (dev only)

### Validation
- **Zod**: Schema validation
- **drizzle-zod**: Auto-generate Zod schemas from Drizzle tables
- **@hookform/resolvers**: Form validation integration