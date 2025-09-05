'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn && user) {
      // Redirect signed-in users to their appropriate dashboard
      router.push('/api/auth/redirect');
    }
  }, [isSignedIn, user, router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Launch Your
            <span className="text-blue-600 dark:text-blue-400"> Career </span>
            with Our Internship Program
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Join our comprehensive internship management platform. Connect with top companies, 
            track your applications, and accelerate your professional growth with guided learning paths.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Authentication buttons trigger Clerk modals */}
            <SignedOut>
              <SignUpButton 
                mode="modal"
                forceRedirectUrl="/api/auth/redirect"
              >
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Get Started Today
                </Button>
              </SignUpButton>
              <SignInButton 
                mode="modal"
                forceRedirectUrl="/api/auth/redirect"
              >
                <Button variant="outline" size="lg" className="px-8 py-3 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/internships">
                <Button variant="outline" size="lg" className="px-8 py-3 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  Browse Internships
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Our platform provides comprehensive tools to help you find, apply for, 
            and excel in internship opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="text-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <CardTitle className="text-slate-900 dark:text-white">Find Opportunities</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Browse hundreds of internship opportunities from top companies across various industries.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="text-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CardTitle className="text-slate-900 dark:text-white">Track Applications</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Manage all your applications in one place with real-time status updates and feedback.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="text-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <CardTitle className="text-slate-900 dark:text-white">Skill Development</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Access curated learning paths and tasks to develop skills that employers are looking for.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 text-blue-100 dark:text-blue-200">
              Join thousands of students who have launched their careers through our platform.
            </p>
            
            <SignedOut>
              <SignUpButton 
                mode="modal"
                forceRedirectUrl="/api/auth/redirect"
              >
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-white px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Create Your Account
                </Button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              <Link href="/internships">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-white px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Explore Internships
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  )
}
