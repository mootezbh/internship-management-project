# 🛠️ Installation Guide

This guide will walk you through setting up the Internship Management Platform on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18.17+** (LTS recommended)
- **npm 9+** or **yarn 1.22+**
- **PostgreSQL 14+**
- **Git**

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd internship-management

# Verify Node.js version
node --version  # Should be 18.17+
npm --version   # Should be 9+
```

## Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Or if you prefer yarn
yarn install
```

## Step 3: Environment Configuration

```bash
# Create environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/internship_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_here"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Clerk URLs
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Uploadthing
UPLOADTHING_SECRET="sk_live_your_secret"
UPLOADTHING_APP_ID="your_app_id"

```

## Step 4: Database Setup

### Option A: Local PostgreSQL

```bash
# Create database
createdb internship_db

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed sample data
npx prisma db seed
```

### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker-compose up -d

# Run database setup
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Step 5: Authentication Setup (Clerk)

1. **Create Clerk Account**
   - Visit [clerk.com](https://clerk.com)
   - Create a new application
   - Get your publishable and secret keys

2. **Configure Webhooks** (Optional)
   - In Clerk dashboard, go to Webhooks
   - Add endpoint: `http://localhost:3000/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`

## Step 6: File Upload Setup (Uploadthing)

1. **Create Uploadthing Account**
   - Visit [uploadthing.com](https://uploadthing.com)
   - Create new project
   - Get your secret key and app ID

2. **Configure Upload Endpoints**
   - File upload configuration is in `src/app/api/uploadthing/core.js`
   - Supported file types: images, PDFs (for CVs)

## Step 7: Start Development Server

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

Visit `http://localhost:3000` to see your application running!

## Step 8: Verify Installation

### Check Database Connection

```bash
# Open Prisma Studio to verify database
npx prisma studio
```

### Test Authentication

1. Navigate to `http://localhost:3000/`
2. Create a test account
3. Verify onboarding flow works

### Test File Uploads

1. Complete user onboarding
2. Try uploading a profile image or CV
3. Verify files are stored correctly

## Common Issues and Solutions

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart

# Verify database exists
psql -l | grep internship_db
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db reset
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Node Modules Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the [Development Guide](./development.md) for coding standards
- Check out the [Architecture Overview](./architecture.md)
- Explore the [API Reference](./api-reference.md)

## Production Installation

For production deployment, see the [Deployment Guide](./deployment.md).

---

**Need Help?** Check the [Troubleshooting Guide](./troubleshooting.md) or create an issue.
