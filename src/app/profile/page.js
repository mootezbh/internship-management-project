'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageLoading } from '@/components/ui/loading-spinner'
import { User, FileText } from 'lucide-react'
import { toast } from 'sonner'

function ProfileContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)

  // Handle CV open
  const handleOpenCV = () => {
    if (profileData?.cvUrl) {
      window.open(profileData.cvUrl, '_blank')
    } else {
      toast.error('No CV available to view')
    }
  }

  // Check if user has completed onboarding and fetch profile data
  useEffect(() => {
    if (!user) return

    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setProfileData(data)
          
          if (!data.profileComplete) {
            // User hasn't completed onboarding, redirect to onboarding
            router.push('/onboarding')
            return
          }
        } else {
          // Check with the old endpoint for profile completion
          const checkResponse = await fetch('/api/profile/check', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (checkResponse.ok) {
            const checkData = await checkResponse.json()
            if (!checkData.profileCompleted) {
              router.push('/onboarding')
              return
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile data')
      }
      
      setIsLoading(false)
    }

    fetchProfileData()
  }, [user, router])

  if (!user || isLoading) return (
    <PageLoading 
      title="Loading Profile" 
      subtitle="Preparing your profile information..."
      variant="primary"
      icon={User}
    />
  )

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 dark:border-slate-700 rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
            <p className="text-gray-600 dark:text-slate-300">Manage your account settings and preferences.</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Name</label>
                <p className="text-gray-900 dark:text-white">
                  {profileData?.name || `${user.firstName} ${user.lastName}`}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                <p className="text-gray-900 dark:text-white">
                  {profileData?.email || user.emailAddresses[0]?.emailAddress}
                </p>
              </div>

              {profileData?.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Phone</label>
                  <p className="text-gray-900 dark:text-white">
                    {profileData.phone}
                  </p>
                </div>
              )}

              {profileData?.university && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">University</label>
                  <p className="text-gray-900 dark:text-white">
                    {profileData.university}
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Member Since</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(profileData?.createdAt || user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60">
                  Edit Profile
                </Button>
                
                {profileData?.cvUrl && (
                  <Button 
                    onClick={handleOpenCV}
                    variant="outline" 
                    className="w-full border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Open CV</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Account Type</label>
                <p className="text-gray-900 dark:text-white">
                  {profileData?.role === 'ADMIN' ? 'Administrator' : 'Student'}
                </p>
              </div>

              {profileData?.degree && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Degree</label>
                  <p className="text-gray-900 dark:text-white">{profileData.degree}</p>
                </div>
              )}

              {profileData?.major && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Major</label>
                  <p className="text-gray-900 dark:text-white">{profileData.major}</p>
                </div>
              )}

              {profileData?.graduationYear && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Graduation Year</label>
                  <p className="text-gray-900 dark:text-white">{profileData.graduationYear}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Profile Status</label>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  {profileData?.profileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                </p>
              </div>

              <Button variant="outline" className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60">
                Manage Settings
              </Button>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(profileData?.bio || profileData?.skills?.length > 0 || profileData?.interests) && (
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData?.bio && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Bio</label>
                    <p className="text-gray-900 dark:text-white text-sm">{profileData.bio}</p>
                  </div>
                )}

                {profileData?.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profileData?.interests && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Interests</label>
                    <p className="text-gray-900 dark:text-white text-sm">{profileData.interests}</p>
                  </div>
                )}

                {profileData?.linkedinUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">LinkedIn</label>
                    <a 
                      href={profileData.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm block"
                    >
                      View LinkedIn Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
            Delete Account
          </Button>
          <Button variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60">
            Export Data
          </Button>
          <Button
            variant="secondary"
            className="ml-auto"
            onClick={() => {
              const from = searchParams.get('from')
              if (from) {
                router.push(from)
              } else {
                router.push('/dashboard')
              }
            }}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  </div>
  )
}

export default function ProfilePage() {
  return (
    <>
      <SignedIn>
        <ProfileContent />
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
