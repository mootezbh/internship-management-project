# 🏗️ Project Architecture

This document provides a comprehensive overview of the Internship Management Platform's architecture, design patterns, and technical decisions.

## System Overview

The platform follows a modern full-stack architecture built on Next.js with the following key principles:

- **Server-First Rendering** - Optimized for performance and SEO
- **Component-Driven Development** - Reusable, maintainable UI components
- **Type Safety** - Gradual TypeScript adoption with JSDoc
- **Database-First Design** - Prisma ORM with PostgreSQL

## Technology Stack

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│                Browser                   │
├─────────────────────────────────────────┤
│            React 19 Client              │
│    ┌─────────────────────────────────┐  │
│    │      Tailwind CSS               │  │
│    │   ┌─────────────────────────┐   │  │
│    │   │   Shadcn/UI Components  │   │  │
│    │   └─────────────────────────┘   │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│         Next.js 15 App Router           │
│    ┌─────────────────────────────────┐  │
│    │    Server Components           │  │
│    │    Client Components           │  │
│    │    API Routes                  │  │
│    └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────┐
│            Next.js API Routes            │
├─────────────────────────────────────────┤
│              Clerk Auth                 │
│    ┌─────────────────────────────────┐  │
│    │    User Management              │  │
│    │    Role-based Access           │  │
│    │    Webhook Integration          │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│               Prisma ORM                │
│    ┌─────────────────────────────────┐  │
│    │    Type-safe Queries           │  │
│    │    Schema Management           │  │
│    │    Migration System            │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│              PostgreSQL                 │
└─────────────────────────────────────────┘
```

## Directory Structure

### Application Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   │   ├── sign-in/         # Sign in page
│   │   └── sign-up/         # Sign up page
│   │
│   ├── admin/               # Admin dashboard
│   │   ├── dashboard/       # Admin overview
│   │   ├── users/           # User management
│   │   ├── internships/     # Internship CRUD
│   │   ├── applications/    # Application review
│   │   ├── learning-paths/  # Learning path builder
│   │   └── settings/        # Admin settings
│   │
│   ├── dashboard/           # User dashboard
│   │   ├── profile/         # User profile
│   │   ├── applications/    # User applications
│   │   ├── learning/        # Learning progress
│   │   └── tasks/           # Task submissions
│   │
│   ├── internships/         # Public internship pages
│   │   ├── [id]/           # Individual internship
│   │   └── apply/          # Application form
│   │
│   ├── onboarding/          # User onboarding flow
│   │   ├── cv-upload/      # CV upload step
│   │   ├── skills/         # Skills assessment
│   │   └── preferences/    # User preferences
│   │
│   └── api/                 # API endpoints
│       ├── internships/     # Internship CRUD
│       ├── applications/    # Application management
│       ├── users/           # User operations
│       ├── learning-paths/  # Learning path API
│       ├── webhooks/        # Webhook handlers
│       └── uploadthing/     # File upload API
```

### Component Architecture

```
src/components/
├── ui/                      # Base UI components (Shadcn)
│   ├── button.js           # Button component
│   ├── input.js            # Input component
│   ├── card.js             # Card component
│   ├── badge.js            # Badge component
│   ├── dialog.js           # Modal dialogs
│   └── ...                 # Other base components
│
├── forms/                   # Form components
│   ├── InternshipForm.js   # Internship creation/edit
│   ├── ApplicationForm.js  # Application form
│   ├── UserProfileForm.js  # User profile form
│   └── TaskForm.js         # Task creation form
│
├── shared/                  # Shared components
│   ├── Header.js           # Global header
│   ├── Navigation.js       # Navigation components
│   ├── Footer.js           # Global footer
│   ├── Sidebar.js          # Dashboard sidebar
│   └── LoadingSpinner.js   # Loading states
│
├── admin/                   # Admin-specific components
│   ├── AdminDashboard.js   # Admin dashboard
│   ├── UserTable.js        # User management table
│   ├── InternshipList.js   # Internship management
│   └── ApplicationReview.js # Application review
│
└── user/                    # User-specific components
    ├── ProfileCard.js       # User profile display
    ├── ApplicationCard.js   # Application status
    ├── ProgressTracker.js   # Learning progress
    └── TaskSubmission.js    # Task submission form
```

## Data Flow Architecture

### State Management Pattern

```
┌─────────────────────────────────────────┐
│              User Action                │
├─────────────────────────────────────────┤
│             Component                   │
│    ┌─────────────────────────────────┐  │
│    │        useState/useEffect       │  │
│    │     ┌─────────────────────┐     │  │
│    │     │   Custom Hooks      │     │  │
│    │     └─────────────────────┘     │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│              API Layer                  │
│    ┌─────────────────────────────────┐  │
│    │       fetch/API calls           │  │
│    │     ┌─────────────────────┐     │  │
│    │     │   Error Handling    │     │  │
│    │     └─────────────────────┘     │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│             Database                    │
│    ┌─────────────────────────────────┐  │
│    │         Prisma ORM              │  │
│    │     ┌─────────────────────┐     │  │
│    │     │    PostgreSQL       │     │  │
│    │     └─────────────────────┘     │  │
│    └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   User Login    │───▶│   Clerk Auth    │───▶│  JWT Token      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  User Session   │───▶│   Middleware    │───▶│  Protected      │
│                 │    │   Validation    │    │  Routes         │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Design

### Entity Relationship Model

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│     Users       │───▶│  Applications   │◀───│  Internships    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   UserSkills    │    │     Tasks       │    │ LearningPaths   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Models

#### User Model
```javascript
model User {
  id                String   @id @default(cuid())
  clerkId          String   @unique
  email            String   @unique
  firstName        String?
  lastName         String?
  profileImage     String?
  cvUrl            String?
  skills           UserSkill[]
  applications     Application[]
  taskSubmissions  TaskSubmission[]
  role             Role     @default(USER)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

#### Internship Model
```javascript
model Internship {
  id              String   @id @default(cuid())
  title           String
  description     String
  company         String
  location        String
  type            InternshipType
  duration        String
  requirements    String[]
  benefits        String[]
  status          InternshipStatus @default(ACTIVE)
  learningPath    LearningPath?
  applications    Application[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────┐
│           Request Headers               │
│    ┌─────────────────────────────────┐  │
│    │     Authorization: Bearer       │  │
│    │     <Clerk JWT Token>           │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│           Middleware Layer              │
│    ┌─────────────────────────────────┐  │
│    │     Token Validation            │  │
│    │     Role Verification           │  │
│    │     Route Protection            │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│            Route Handler               │
│    ┌─────────────────────────────────┐  │
│    │     User Context                │  │
│    │     Permission Checks           │  │
│    │     Data Access                 │  │
│    └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Data Validation

```
┌─────────────────────────────────────────┐
│             Client Input                │
├─────────────────────────────────────────┤
│          Zod Schema Validation          │
│    ┌─────────────────────────────────┐  │
│    │     Type Checking               │  │
│    │     Format Validation           │  │
│    │     Business Rules              │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│           Prisma Validation             │
│    ┌─────────────────────────────────┐  │
│    │     Database Constraints        │  │
│    │     Relationship Validation     │  │
│    │     Unique Constraints          │  │
│    └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Performance Considerations

### Rendering Strategy

- **Server Components** - Default for data fetching and static content
- **Client Components** - Interactive elements and state management
- **Static Generation** - Public pages (landing, internship listings)
- **Server-Side Rendering** - Dynamic, user-specific content

### Optimization Techniques

- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **Database Optimization** - Prisma query optimization
- **Caching Strategy** - Next.js built-in caching

### Monitoring & Observability

- **Error Tracking** - Client and server error monitoring
- **Performance Metrics** - Core Web Vitals tracking
- **Database Monitoring** - Query performance analysis
- **User Analytics** - Usage patterns and behavior

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│               CDN (Vercel)              │
├─────────────────────────────────────────┤
│            Load Balancer                │
├─────────────────────────────────────────┤
│          Next.js Application            │
│    ┌─────────────────────────────────┐  │
│    │      Server Components          │  │
│    │      API Routes                 │  │
│    │      Static Assets              │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│           External Services             │
│    ┌─────────────────────────────────┐  │
│    │     Clerk Auth                  │  │
│    │     Uploadthing                 │  │
│    │     PostgreSQL DB               │  │
│    └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

This architecture provides a solid foundation for scalability, maintainability, and performance while following modern web development best practices.
