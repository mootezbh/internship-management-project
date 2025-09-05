# 🔐 Authentication & Security

This document covers the authentication system, security measures, and best practices implemented in the Internship Management Platform.

## Authentication Overview

The platform uses [Clerk](https://clerk.com) for authentication, providing a complete user management solution with the following features:

- **Multi-factor Authentication (MFA)**
- **Social Login** (Google, GitHub, etc.)
- **Email/Password Authentication**
- **Session Management**
- **User Profiles**
- **Webhook Integration**

## Authentication Flow

### User Registration Process

```mermaid
graph TD
    A[User visits /sign-up] --> B[Clerk Registration Form]
    B --> C[Email Verification]
    C --> D[Account Created]
    D --> E[Clerk Webhook Triggered]
    E --> F[User Record Created in DB]
    F --> G[Redirect to Onboarding]
```

### Login Process

```mermaid
graph TD
    A[User visits /sign-in] --> B[Clerk Login Form]
    B --> C[Credentials Validation]
    C --> D[JWT Token Generated]
    D --> E[Session Established]
    E --> F[Redirect to Dashboard]
```

## Role-Based Access Control (RBAC)

### User Roles

The platform implements a simple role-based system:

#### USER Role (Default)
- Access to personal dashboard
- Browse internships
- Submit applications
- Complete learning paths
- Submit tasks

#### ADMIN Role
- All USER permissions
- Access admin dashboard
- Manage users
- CRUD operations on internships
- Review applications
- Manage learning paths

### Role Assignment

```javascript
// Automatic admin assignment based on email
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  // Add more admin emails as needed
];

// In Clerk webhook handler
const isAdmin = ADMIN_EMAILS.includes(user.email);
const role = isAdmin ? 'ADMIN' : 'USER';
```

## Route Protection

### Middleware-Based Protection

The application uses Next.js middleware for route protection:

```javascript
// middleware.js
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/internships",
    "/internships/(.*)",
    "/api/webhooks/(.*)",
  ],
  
  // Admin-only routes
  beforeAuth: (auth, req) => {
    // Custom logic before authentication
  },
  
  afterAuth: (auth, req) => {
    // Redirect logic after authentication
    if (auth.isPublicRoute) return;
    
    if (!auth.userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // Admin route protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Check if user has admin role
      return checkAdminRole(auth.userId, req);
    }
  }
});
```

### Component-Level Protection

```javascript
// Higher-order component for admin protection
export function withAdminAuth(Component) {
  return function AdminProtectedComponent(props) {
    const { user } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
      if (user?.id) {
        checkUserRole(user.id).then(setIsAdmin);
      }
    }, [user]);
    
    if (!isAdmin) {
      return <AccessDenied />;
    }
    
    return <Component {...props} />;
  };
}

// Usage
export default withAdminAuth(AdminDashboard);
```

## API Security

### Request Authentication

All API routes are protected using Clerk's `auth()` helper:

```javascript
// api/internships/route.js
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Process request
}

export async function POST() {
  const { userId } = auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Check admin role for create operations
  const user = await getUserById(userId);
  if (user.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Process admin request
}
```

### Data Validation

Input validation using Zod schemas:

```javascript
import { z } from 'zod';

const InternshipSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  company: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'REMOTE']),
  requirements: z.array(z.string()),
  benefits: z.array(z.string())
});

// In API handler
export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = InternshipSchema.parse(body);
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
  }
}
```

## Clerk Webhook Security

### Webhook Verification

```javascript
// api/webhooks/clerk/route.js
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }
  
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');
  
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }
  
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt;
  
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }
  
  // Handle verified webhook event
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    await handleUserCreated(evt.data);
  }
  
  return new Response('Success', { status: 200 });
}
```

## Security Best Practices

### Environment Variables

```bash
# Production environment variables
DATABASE_URL="postgresql://user:pass@host:5432/db"
CLERK_SECRET_KEY="sk_live_xxx"  # Never expose in client
CLERK_WEBHOOK_SECRET="whsec_xxx"
UPLOADTHING_SECRET="sk_live_xxx"

# Public environment variables (safe for client)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_xxx"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
```

### Content Security Policy (CSP)

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: *.clerk.accounts.dev *.uploadthing.com;
      connect-src 'self' *.clerk.accounts.dev *.uploadthing.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Database Security

```javascript
// Prisma query with user context
export async function getUserInternships(userId) {
  return await prisma.application.findMany({
    where: {
      userId: userId,  // Always filter by user context
    },
    include: {
      internship: true,
    },
  });
}

// Admin queries with role check
export async function getAllUsers(requesterId) {
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
  });
  
  if (requester.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      // Exclude sensitive fields
    },
  });
}
```

### File Upload Security

```javascript
// uploadthing configuration
export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "2MB" } })
    .middleware(async ({ req }) => {
      const { userId } = auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update user profile with new image URL
      await updateUserProfile(metadata.userId, {
        profileImage: file.url
      });
    }),
    
  cvUpload: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { userId } = auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Process CV upload
      await updateUserProfile(metadata.userId, {
        cvUrl: file.url
      });
    }),
};
```

## Session Management

### Session Configuration

Clerk handles session management automatically with:

- **Session Duration** - Configurable in Clerk dashboard
- **Refresh Tokens** - Automatic token refresh
- **Multi-device Support** - Sessions across devices
- **Session Revocation** - Admin can revoke user sessions

### Custom Session Handling

```javascript
// Custom hook for session management
export function useAuthSession() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [sessionData, setSessionData] = useState(null);
  
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Load additional session data
      loadUserSessionData(user.id).then(setSessionData);
    }
  }, [user, isLoaded, isSignedIn]);
  
  return {
    user,
    sessionData,
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
  };
}
```

## Monitoring & Logging

### Security Event Logging

```javascript
// Security event logging
export function logSecurityEvent(event, userId, details) {
  console.log(`[SECURITY] ${event}`, {
    userId,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
    ...details
  });
  
  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // sendToMonitoringService(event, userId, details);
  }
}

// Usage in API routes
export async function POST(request) {
  const { userId } = auth();
  
  if (!userId) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', null, {
      path: request.url,
      method: 'POST'
    });
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Process request
}
```

## Compliance Considerations

### GDPR Compliance

- **Data Minimization** - Only collect necessary user data
- **Right to Deletion** - User can delete their account
- **Data Portability** - Export user data functionality
- **Consent Management** - Clear privacy policy and consent

### Data Protection

- **Encryption at Rest** - Database encryption
- **Encryption in Transit** - HTTPS everywhere
- **Data Anonymization** - Remove PII from logs
- **Regular Backups** - Encrypted database backups

---

This security implementation provides a robust foundation for protecting user data and maintaining system integrity while following industry best practices.
