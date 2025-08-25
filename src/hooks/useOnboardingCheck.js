'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useOnboardingCheck() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsChecking(false)
      return
    }

    const checkOnboarding = async () => {
      try {
        const response = await fetch('/api/profile/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // If profile is not completed, redirect to onboarding
          if (!data.profileCompleted) {
            router.push('/onboarding')
            return
          }
        } else {}
      } catch (error) {}
      
      setIsChecking(false)
    }

    checkOnboarding()
  }, [user, isLoaded, router])

  return { isChecking }
}
