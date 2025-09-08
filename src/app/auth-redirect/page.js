'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function AuthRedirect() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

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
          console.log('Checking user role for:', user.emailAddresses[0]?.emailAddress)
          
          // Fetch user profile to get role
          const response = await fetch('/api/profile')
          
          if (response.ok) {
            const userData = await response.json()
            console.log('User data received:', userData)
            
            if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
              console.log('Redirecting to /admin')
              router.push('/admin')
              return
            } else if (!userData.profileComplete) {
              console.log('Redirecting to /onboarding - profile incomplete')
              router.push('/onboarding')
              return
            } else {
              console.log('Redirecting to /dashboard - regular user')
              router.push('/dashboard')
              return
            }
          } else if (response.status === 404) {
            // Profile not found - this might be a new user, redirect to onboarding
            console.log('Profile not found, redirecting to onboarding')
            router.push('/onboarding')
          } else {
            // Other API error - check the user's role from Clerk directly as fallback
            console.log('API error, checking Clerk metadata')
            const publicMetadata = user.publicMetadata || {}
            const role = publicMetadata.role || 'INTERN'
            
            if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
              console.log('Found admin role in Clerk metadata, redirecting to /admin')
              router.push('/admin')
            } else {
              console.log('Defaulting to onboarding due to API error')
              router.push('/onboarding')
            }
          }
        } catch (error) {
          console.error('Error in auth redirect:', error)
          // Check Clerk metadata as fallback
          const publicMetadata = user.publicMetadata || {}
          const role = publicMetadata.role || 'INTERN'
          
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            console.log('Using Clerk metadata fallback - redirecting to /admin')
            router.push('/admin')
          } else {
            console.log('Fallback to onboarding due to error')
            router.push('/onboarding')
          }
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
