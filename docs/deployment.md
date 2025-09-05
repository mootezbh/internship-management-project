# 🚀 Deployment Guide

This guide covers deployment strategies, configurations, and best practices for deploying the Internship Management Platform to production environments.

## Deployment Options

### Vercel (Recommended)

Vercel provides the best Next.js deployment experience with zero configuration and automatic optimizations.

#### Setup Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   Configure in Vercel Dashboard:
   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@host:5432/db
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
   CLERK_SECRET_KEY=sk_live_xxx
   CLERK_WEBHOOK_SECRET=whsec_xxx
   
   # Upload service
   UPLOADTHING_SECRET=sk_live_xxx
   UPLOADTHING_APP_ID=xxx
   
   # Admin configuration
   ADMIN_EMAIL=admin@yourcompany.com
   ```

3. **Build Configuration**
   ```javascript
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "regions": ["iad1"], // Choose closest region
     "functions": {
       "app/api/**/*.js": {
         "maxDuration": 30
       }
     }
   }
   ```

### Docker Deployment

For self-hosted environments or container orchestration.

#### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/internship_db
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: internship_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### AWS Deployment

For enterprise-grade deployments with full control.

#### EC2 with Application Load Balancer

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security groups for HTTP/HTTPS

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   ```

3. **Application Setup**
   ```bash
   # Clone repository
   git clone <repository-url> /opt/internship-management
   cd /opt/internship-management
   
   # Install dependencies
   npm ci --only=production
   
   # Build application
   npm run build
   
   # Setup database
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **PM2 Configuration**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'internship-management',
       script: './server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         DATABASE_URL: process.env.DATABASE_URL,
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

5. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/internship-management
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Database Deployment

### Managed PostgreSQL

#### Supabase
```bash
# Create new project at supabase.com
# Copy connection string
DATABASE_URL="postgresql://postgres:[password]@[host].supabase.co:5432/postgres"
```

#### AWS RDS
```bash
# Create RDS PostgreSQL instance
# Enable automated backups
# Configure security groups
DATABASE_URL="postgresql://username:password@rds-instance.region.rds.amazonaws.com:5432/internship_db"
```

#### Google Cloud SQL
```bash
# Create Cloud SQL PostgreSQL instance
# Enable Cloud SQL Auth Proxy for secure connections
DATABASE_URL="postgresql://username:password@/database?host=/cloudsql/project:region:instance"
```

### Migration Strategy

```bash
# Production migration process
# 1. Backup current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
npx prisma migrate deploy

# 3. Verify data integrity
npm run db:verify

# 4. Restart application
pm2 restart all
```

## Environment Configuration

### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_xxx"
CLERK_SECRET_KEY="sk_live_xxx"
CLERK_WEBHOOK_SECRET="whsec_xxx"

# Clerk URLs (production domains)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# File uploads
UPLOADTHING_SECRET="sk_live_xxx"
UPLOADTHING_APP_ID="xxx"

# Admin configuration
ADMIN_EMAIL="admin@yourcompany.com"

# Security
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-here"

# Monitoring (optional)
SENTRY_DSN="https://xxx@sentry.io/xxx"
ANALYTICS_ID="G-XXXXXXXXXX"
```

### Security Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: *.clerk.accounts.dev *.uploadthing.com;
              connect-src 'self' *.clerk.accounts.dev *.uploadthing.com;
              font-src 'self';
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['uploadthing.com', 'clerk.accounts.dev'],
    formats: ['image/webp', 'image/avif']
  },

  // Output configuration for deployment
  output: 'standalone',
};

module.exports = nextConfig;
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL

```javascript
// For Cloudflare proxied domains
// Enable "Full (strict)" SSL/TLS encryption mode
// Configure origin certificates in Cloudflare dashboard
```

## Monitoring and Logging

### Health Check Endpoint

```javascript
// app/api/health/route.js
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      database: 'connected'
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}
```

### Application Monitoring

```javascript
// lib/monitoring.js
export function logError(error, context) {
  console.error(`[ERROR] ${context}:`, error);
  
  // Send to monitoring service
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, { tags: { context } });
  }
}

export function logMetric(name, value, tags = {}) {
  if (process.env.NODE_ENV === 'production') {
    // Send to metrics service
    console.log(`[METRIC] ${name}: ${value}`, tags);
  }
}
```

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs internship-management

# Restart application
pm2 restart internship-management

# Save PM2 configuration
pm2 save
pm2 startup
```

## Backup and Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh

# Configuration
DB_URL="${DATABASE_URL}"
BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Create backup
pg_dump ${DB_URL} > ${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_FILE}

# Remove backups older than 30 days
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

## Performance Optimization

### CDN Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.js'
  },
  
  async rewrites() {
    return [
      {
        source: '/assets/:path*',
        destination: 'https://cdn.yourdomain.com/assets/:path*'
      }
    ];
  }
};
```

### Database Connection Pooling

```javascript
// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Configure connection pool
// In DATABASE_URL: ?connection_limit=10&pool_timeout=20
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues

```bash
# Test database connection
npx prisma db push --preview-feature

# Check connection string format
echo $DATABASE_URL
```

#### Environment Variable Issues

```bash
# Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"
```

### Rollback Strategy

```bash
# 1. Stop current application
pm2 stop internship-management

# 2. Restore database backup
psql $DATABASE_URL < backup_20240101_120000.sql

# 3. Checkout previous version
git checkout previous-working-commit
npm run build

# 4. Restart application
pm2 start ecosystem.config.js
```

## Security Checklist

- [ ] All environment variables secured
- [ ] Database access restricted to application only
- [ ] SSL/TLS certificates configured and auto-renewing
- [ ] Security headers implemented
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] File upload restrictions in place
- [ ] Regular security updates applied
- [ ] Backup and recovery procedures tested

---

This deployment guide ensures a secure, scalable, and maintainable production deployment of the Internship Management Platform.
