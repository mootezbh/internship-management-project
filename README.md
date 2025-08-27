
# Internship Management Platform

A modern web application for managing internships, learning paths, applications, and users. Built with Next.js, Prisma, Clerk authentication, and Tailwind CSS.

## Features

- **Admin Dashboard:** Manage internships, applications, users, and learning paths.
- **Internship CRUD:** Create, view, edit, and delete internships. Assign learning paths and track statistics.
- **Learning Paths:** Build and organize learning paths with drag-and-drop task setup.
- **Application Form Builder:** Customize internship application forms with a drag-and-drop interface.
- **User Management:** View and manage user profiles, skills, and application history.
- **Task Builder:** Interactive drag-and-drop builder for learning path tasks.
- **Role-Based Access:** Secure admin and user workflows with Clerk authentication.
- **Responsive Design:** Optimized for desktop and mobile with dark mode support.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM
- **Auth:** Clerk
- **Database:** PostgreSQL (or your preferred provider)
- **File Uploads:** Uploadthing (replaces Cloudinary)
- **Deployment:** Vercel

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-org/internship-management.git
   cd internship-management
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env.local` and fill in your database, Clerk, and Uploadthing credentials.

4. **Run database migrations:**

   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Access the app:**

   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## File Uploads (Uploadthing)

This project uses [Uploadthing](https://uploadthing.com/) for file uploads (profile images, CVs, etc). Cloudinary is no longer used.

- Configure your Uploadthing API keys in `.env.local`.
- Upload endpoints are defined in `src/app/api/uploadthing/core.js` and exposed via `src/app/api/uploadthing/route.js`.
- The frontend uses Uploadthing's React components (see `src/components/FileUpload.js`).

## Folder Structure

- `src/app` — Next.js pages and API routes
- `src/components` — Reusable UI and builder components
- `prisma` — Prisma schema and migrations
- `public` — Static assets

## Customization

## Clerk Webhooks

The platform integrates with Clerk for authentication and user management. Clerk webhooks allow you to receive real-time notifications about user events and automate workflows.

### Supported Clerk Webhook Events

- `user.created`: Triggered when a new user registers.
- `user.updated`: Triggered when a user's profile is updated.
- `user.deleted`: Triggered when a user account is deleted.
- `user.signed_in`: Triggered when a user signs in.

### How to Set Up Clerk Webhooks

1. Go to your Clerk dashboard: [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Navigate to **Webhooks** under your application settings.
3. Click **Add Webhook** and enter your endpoint URL (e.g., `https://your-domain.com/api/webhooks/clerk`).
4. Select the events you want to subscribe to.
5. Save the webhook configuration.



Refer to the [Clerk Webhooks documentation](https://clerk.com/docs/webhooks) for more details and security recommendations.

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router and Server Components
- **React 19** - Latest React features with concurrent rendering
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern, accessible component library
- **Lucide React** - Beautiful, consistent icon system

### **Backend**
- **Next.js API Routes** - Serverless API endpoints with edge runtime
- **Prisma ORM** - Type-safe database access with migrations
- **PostgreSQL** - Robust relational database with advanced features
- **Clerk Authentication** - Production-ready auth with webhook support

### **Development & Deployment**
- **Docker Support** - Containerized development and deployment
- **ESLint + Prettier** - Code quality and formatting
- **Git Hooks** - Pre-commit quality checks
- **Vercel Ready** - Optimized for seamless deployment

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **PostgreSQL 14+** (or Docker for local development)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mootezbh/internship-management-project.git
   cd internship-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/internship_db"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   CLERK_WEBHOOK_SECRET="your_webhook_secret"
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # (Optional) Seed sample data
   npx prisma db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Docker Development (Alternative)

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Run migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

## 📁 Project Structure

```
internship-management/
├── 📁 src/
│   ├── 📁 app/                     # Next.js App Router pages
│   │   ├── 📁 admin/              # Admin-only pages
│   │   ├── 📁 api/                # API routes
│   │   ├── 📁 dashboard/          # User dashboard
│   │   └── 📁 auth/               # Authentication pages
│   ├── 📁 components/             # Reusable UI components
│   │   ├── 📁 ui/                 # Shadcn/ui components
│   │   └── 📁 layout/             # Layout components
│   ├── 📁 lib/                    # Utility functions
│   └── 📁 hooks/                  # Custom React hooks
├── 📁 prisma/                     # Database schema and migrations
├── 📁 docs/                       # Project documentation
├── 📄 docker-compose.yml          # Docker configuration
└── 📄 package.json               # Dependencies and scripts
```

## 🗄️ Database Schema

### Core Entities
- **Users** - User profiles with authentication data
- **Internships** - Internship opportunities with details
- **Applications** - User applications to internships
- **LearningPaths** - Structured learning curricula
- **Tasks** - Individual learning assignments
- **Submissions** - User task submissions and reviews

### Key Relationships
- Users can apply to multiple Internships
- Internships can have associated Learning Paths
- Learning Paths contain sequential Tasks
- Users submit Solutions for Tasks
- Admins review and provide feedback

## 🔐 Authentication & Authorization

### User Roles
- **Student** - Can browse internships, apply, and complete learning paths
- **Admin** - Full system access including user management and content creation

### Security Features
- **JWT-based authentication** via Clerk
- **Role-based route protection**
- **API endpoint authorization**
- **Webhook signature verification**
- **Input validation and sanitization**

## 🎯 User Workflows

### Student Journey
1. **Sign up** and complete profile onboarding
2. **Browse internships** with filtering options
3. **Apply to internships** with one-click application
4. **Access learning paths** for accepted internships
5. **Complete tasks** and submit via GitHub
6. **Track progress** and receive feedback

### Admin Workflow
1. **Review applications** with bulk actions
2. **Manage user accounts** and roles
3. **Create internships** and assign learning paths
4. **Build learning paths** with task sequences
5. **Review submissions** and provide feedback
6. **Monitor system analytics** and user activity

## 🔧 API Endpoints

### Public Routes
- `GET /api/internships` - List internships
- `POST /api/applications` - Submit application

### Protected Routes
- `GET /api/profile` - User profile data
- `POST /api/submissions` - Submit task solution

### Admin Routes
- `GET /api/admin/users` - User management
- `POST /api/admin/internships` - Create internship
- `GET /api/admin/stats` - System analytics

## 🧪 Development

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Database Management
```bash
# Reset database
npm run db:reset

# View data
npm run db:studio

# Generate migration
npx prisma migrate dev --name migration_name
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build application
npm run build

# Start production server
npm start
```

## 📊 Features Overview

### ✅ Completed Features
- User authentication and authorization
- Complete internship application system
- Learning path and task management
- Admin dashboard with user management
- Real-time progress tracking
- Task submission and review system
- Responsive UI with modern design
- Database migrations and seeding

### 🔄 Continuous Improvements
- Enhanced analytics and reporting
- Advanced filtering and search
- Email notifications system
- File upload capabilities
- Mobile app compatibility
- Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Clerk** for seamless authentication
- **Prisma** for excellent database tooling
- **Shadcn/ui** for beautiful components
- **Vercel** for hosting and deployment

---

Built with ❤️ using modern web technologies for a seamless internship management experience.
