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
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    const checkUserRoleAndRedirect = async () => {
      try {
        // Fetch user profile to get role
        const response = await fetch('/api/profile')
        
        if (response.ok) {
          const userData = await response.json()
          
          if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
            router.push('/admin')
            return
          } else if (!userData.profileComplete) {
            router.push('/onboarding')
            return
          } else {
            router.push('/dashboard')
            return
          }
        } else {
          // Default to onboarding if profile not found
          router.push('/onboarding')
        }
      } catch (error) {
        // Default to dashboard on error
        router.push('/dashboard')
      } finally {
        setIsChecking(false)
      }
    }
    checkUserRoleAndRedirect()
  }, [user, isLoaded, router])

  if (!isLoaded || isChecking) {
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
