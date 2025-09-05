# 💻 Development Guide

This guide covers development workflows, coding standards, and best practices for contributing to the Internship Management Platform.

## Development Environment Setup

### Prerequisites Verification

```bash
# Verify versions
node --version    # Should be 18.17+
npm --version     # Should be 9+
git --version     # Any recent version

# Check PostgreSQL
psql --version    # Should be 14+
```

### Development Workflow

```bash
# 1. Start PostgreSQL (if using local)
sudo service postgresql start

# 2. Start development server
npm run dev

# 3. Open additional terminals for:
# - Database management
npx prisma studio

# - Linting and testing
npm run lint
```

## Coding Standards

### JavaScript/React Standards

#### Component Structure

```javascript
// components/ui/Card.js
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card component for displaying content in a contained box
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Export variants
export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  );
}
```

#### Page Component Structure

```javascript
// app/dashboard/page.js
import { auth } from '@clerk/nextjs';
import { getUserDashboardData } from '@/lib/api';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

/**
 * User Dashboard Page
 * Displays personalized dashboard with applications, progress, and recommendations
 */
export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const dashboardData = await getUserDashboardData(userId);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your internship journey.
          </p>
        </div>
        
        <DashboardContent data={dashboardData} />
      </div>
    </div>
  );
}
```

#### API Route Structure

```javascript
// app/api/internships/route.js
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InternshipCreateSchema } from '@/lib/validations';

/**
 * GET /api/internships
 * Fetch all active internships with optional filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    
    const whereClause = {
      status: 'ACTIVE',
      ...(type && { type }),
      ...(location && { 
        location: { contains: location, mode: 'insensitive' } 
      }),
    };
    
    const internships = await prisma.internship.findMany({
      where: whereClause,
      include: {
        applications: {
          select: { id: true },
        },
        learningPath: {
          select: { title: true, taskCount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(internships);
  } catch (error) {
    console.error('[INTERNSHIPS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

/**
 * POST /api/internships
 * Create new internship (Admin only)
 */
export async function POST(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (user?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    const body = await request.json();
    const validatedData = InternshipCreateSchema.parse(body);
    
    const internship = await prisma.internship.create({
      data: validatedData,
    });
    
    return NextResponse.json(internship);
  } catch (error) {
    console.error('[INTERNSHIPS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
```

### Styling Guidelines

#### Tailwind CSS Usage

```javascript
// Use consistent spacing and colors
const styles = {
  // Spacing (prefer t-shirt sizes)
  container: "container mx-auto px-4",
  section: "space-y-8",
  card: "space-y-4",
  
  // Colors (use slate theme consistently)
  text: {
    primary: "text-slate-900 dark:text-slate-100",
    secondary: "text-slate-600 dark:text-slate-400",
    muted: "text-slate-500 dark:text-slate-500",
  },
  
  background: {
    primary: "bg-white dark:bg-slate-900",
    secondary: "bg-slate-50 dark:bg-slate-800",
    muted: "bg-slate-100 dark:bg-slate-800",
  },
  
  border: "border-slate-200 dark:border-slate-700",
  
  // Interactive states
  button: {
    primary: "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
  }
};
```

#### Component Styling

```javascript
// Use cn utility for conditional classes
import { cn } from '@/lib/utils';

export function Button({ variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        
        // Variants
        {
          'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200': 
            variant === 'primary',
          'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700': 
            variant === 'secondary',
          'border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800': 
            variant === 'outline',
        },
        
        // Sizes
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        
        className
      )}
      {...props}
    />
  );
}
```

## Database Development

### Prisma Schema Guidelines

```prisma
// prisma/schema.prisma

model User {
  // Use descriptive field names
  id                String   @id @default(cuid())
  clerkId          String   @unique @map("clerk_id")
  email            String   @unique
  firstName        String?  @map("first_name")
  lastName         String?  @map("last_name")
  
  // Use consistent naming for URLs and files
  profileImageUrl  String?  @map("profile_image_url")
  cvFileUrl        String?  @map("cv_file_url")
  
  // Relationships with clear naming
  applications     Application[]
  taskSubmissions  TaskSubmission[]
  userSkills      UserSkill[]
  
  // Audit fields
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}

model Internship {
  id              String   @id @default(cuid())
  title           String
  description     String   @db.Text
  company         String
  location        String
  
  // Use enums for controlled values
  type            InternshipType
  status          InternshipStatus @default(ACTIVE)
  
  // Arrays for flexible data
  requirements    String[]
  benefits        String[]
  technologies    String[]
  
  // Relationships
  learningPathId  String?          @map("learning_path_id")
  learningPath    LearningPath?    @relation(fields: [learningPathId], references: [id])
  applications    Application[]
  
  // Audit fields
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("internships")
}

enum InternshipType {
  FULL_TIME
  PART_TIME
  REMOTE
  HYBRID
}

enum InternshipStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
}
```

### Database Operations

```javascript
// lib/api/internships.js

/**
 * Get paginated internships with filtering
 */
export async function getInternships({ 
  page = 1, 
  limit = 10, 
  type, 
  location, 
  search 
}) {
  const skip = (page - 1) * limit;
  
  const where = {
    status: 'ACTIVE',
    ...(type && { type }),
    ...(location && { 
      location: { 
        contains: location, 
        mode: 'insensitive' 
      } 
    }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }),
  };
  
  const [internships, total] = await Promise.all([
    prisma.internship.findMany({
      where,
      include: {
        applications: {
          select: { id: true },
        },
        learningPath: {
          select: { 
            id: true, 
            title: true, 
            tasks: { select: { id: true } } 
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.internship.count({ where }),
  ]);
  
  return {
    internships: internships.map(internship => ({
      ...internship,
      applicationCount: internship.applications.length,
      taskCount: internship.learningPath?.tasks.length || 0,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

## Testing Strategy

### Unit Testing Setup

```javascript
// __tests__/components/Button.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  test('applies variant classes correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-slate-100');
  });
  
  test('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing

```javascript
// __tests__/api/internships.test.js
import { GET, POST } from '@/app/api/internships/route';
import { prisma } from '@/lib/prisma';

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(),
}));

describe('/api/internships', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET', () => {
    test('returns internships successfully', async () => {
      const mockInternships = [
        { id: '1', title: 'Test Internship', status: 'ACTIVE' },
      ];
      
      jest.spyOn(prisma.internship, 'findMany').mockResolvedValue(mockInternships);
      
      const request = new Request('http://localhost:3000/api/internships');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockInternships);
    });
  });
  
  describe('POST', () => {
    test('creates internship when user is admin', async () => {
      const mockAuth = require('@clerk/nextjs').auth;
      mockAuth.mockReturnValue({ userId: 'user_123' });
      
      const mockUser = { id: '1', role: 'ADMIN' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      
      const mockInternship = { id: '1', title: 'New Internship' };
      jest.spyOn(prisma.internship, 'create').mockResolvedValue(mockInternship);
      
      const request = new Request('http://localhost:3000/api/internships', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Internship' }),
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockInternship);
    });
  });
});
```

## Performance Guidelines

### Code Splitting

```javascript
// Use dynamic imports for heavy components
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  { 
    loading: () => <AdminDashboardSkeleton />,
    ssr: false  // If component doesn't need SSR
  }
);

// Lazy load form components
const InternshipForm = dynamic(
  () => import('@/components/forms/InternshipForm'),
  { loading: () => <FormSkeleton /> }
);
```

### Database Optimization

```javascript
// Use efficient queries with proper includes
export async function getInternshipWithDetails(id) {
  return prisma.internship.findUnique({
    where: { id },
    include: {
      // Only include necessary relations
      applications: {
        where: { status: 'PENDING' }, // Filter at DB level
        select: { 
          id: true, 
          userId: true, 
          status: true,
          user: { 
            select: { firstName: true, lastName: true } 
          }
        },
      },
      learningPath: {
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true, type: true }
          }
        }
      }
    }
  });
}
```

### Image Optimization

```javascript
// Use Next.js Image component
import Image from 'next/image';

export function UserAvatar({ user }) {
  return (
    <div className="relative h-10 w-10">
      <Image
        src={user.profileImageUrl || '/default-avatar.png'}
        alt={`${user.firstName} ${user.lastName}`}
        fill
        className="rounded-full object-cover"
        sizes="40px"
      />
    </div>
  );
}
```

## Debugging Guidelines

### Development Tools

```javascript
// Use consistent logging
export function debugLog(category, data) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${category.toUpperCase()}]`, data);
  }
}

// API error handling
export function handleApiError(error, context) {
  console.error(`[API_ERROR] ${context}:`, error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  
  if (error.code === 'P2002') { // Prisma unique constraint
    return NextResponse.json(
      { error: 'Resource already exists' },
      { status: 409 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Error Boundaries

```javascript
// components/ErrorBoundary.js
'use client';

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // logToMonitoringService(error, errorInfo);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-red-700">
            {process.env.NODE_ENV === 'development' 
              ? this.state.error?.message 
              : 'An unexpected error occurred. Please try refreshing the page.'
            }
          </p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Git Workflow

### Commit Standards

```bash
# Use conventional commits
git commit -m "feat: add user profile editing functionality"
git commit -m "fix: resolve dashboard loading state issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize database queries"
git commit -m "style: apply consistent slate theme to forms"

# Branch naming
feature/user-profile-editing
fix/dashboard-loading-issue
docs/api-documentation
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md,json}": [
      "prettier --write"
    ]
  }
}
```

This development guide ensures consistent, maintainable, and high-quality code across the entire project.
