'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function AuthRedirect() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  // Log that we reached this page
  useEffect(() => {
    console.log('🔄 AUTH-REDIRECT PAGE LOADED')
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'Server-side')
    console.log('Environment check:')
    console.log('- AFTER_SIGN_IN_URL:', process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL)
    console.log('- AFTER_SIGN_UP_URL:', process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL)
  }, [])

  useEffect(() => {
    // Don't do anything until both isLoaded is true AND we have checked for user
    if (!isLoaded) return
    
    // If loaded but no user, they're definitely not authenticated
    if (isLoaded && !user) {
      router.push('/')
      return
    }
    
    // If we have a user, proceed with role checking
    if (user) {
      const checkUserRoleAndRedirect = async () => {
        try {
          console.log('=== AUTH REDIRECT DEBUG ===')
          console.log('User email:', user.emailAddresses[0]?.emailAddress)
          console.log('User ID:', user.id)
          
          // Fetch user profile from PostgreSQL database
          console.log('Fetching user profile from database...')
          const response = await fetch('/api/profile')
          console.log('Profile API response status:', response.status)
          
          if (response.ok) {
            const userData = await response.json()
            console.log('✅ Database user data:', userData)
            console.log('🔍 User role in database:', userData.role)
            
            if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
              console.log('🎯 ADMIN ROLE FOUND - Redirecting to /admin')
              router.push('/admin')
              return
            } else if (!userData.profileComplete) {
              console.log('📝 Profile incomplete - redirecting to /onboarding')
              router.push('/onboarding')
              return
            } else {
              console.log('👤 Regular user - redirecting to /dashboard')
              router.push('/dashboard')
              return
            }
          } else {
            console.log('❌ Profile API failed - redirecting to /onboarding')
            router.push('/onboarding')
          }
        } catch (error) {
          console.error('Error in auth redirect:', error)
          console.log('Falling back to onboarding due to error')
          router.push('/onboarding')
        } finally {
          setIsChecking(false)
        }
      }
      checkUserRoleAndRedirect()
    }
  }, [user, isLoaded, router])

  if (!isLoaded || (isLoaded && user && isChecking)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Checking your credentials...
          </p>
        </div>
      </div>
    )
  }

  return null
}
