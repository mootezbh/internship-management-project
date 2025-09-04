'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageLoading } from '@/components/ui/loading-spinner'
import { User, FileText, Edit2, Save, X, Upload, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { SKILLS_CATEGORIES } from '@/lib/data/categories'
import FileUpload from '@/components/FileUpload'
import Image from 'next/image'

function ProfileContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [editData, setEditData] = useState({})
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('')

  // Handle CV open
  const handleOpenCV = () => {
    if (profileData?.cvUrl) {
      window.open(profileData.cvUrl, '_blank')
    } else {
      toast.error('No CV available to view')
    }
  }

  // Handle skill toggle
  const handleSkillToggle = (skill) => {
    const currentSkills = editData.skills || []
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill]
    setEditData(prev => ({ ...prev, skills: updatedSkills }))
  }

  // Handle interest toggle
  const handleInterestToggle = (interest) => {
    const currentInterests = editData.interests || []
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]
    setEditData(prev => ({ ...prev, interests: updatedInterests }))
  }

  // Start editing
  const startEditing = () => {
    setEditData({ ...profileData })
    setIsEditing(true)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditData({})
    setIsEditing(false)
    setSelectedSkillCategory('')
  }

  // Save changes
  const saveChanges = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updatedData = await response.json()
        setProfileData(updatedData.user)
        setIsEditing(false)
        setEditData({})
        toast.success('Profile updated successfully!')
        
        // Refresh the user profile in the navbar if profile image was updated
        if (editData.profilePictureUrl && typeof window !== 'undefined' && window.refreshUserProfile) {
          await window.refreshUserProfile();
        }
      } else {
        const errorData = await response.json()
        toast.error(`Failed to update profile: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error(`Error updating profile: ${error.message}`)
    } finally {
      setIsSaving(false)
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

  const displayData = isEditing ? editData : profileData
  const interests = ['Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Research', 'Startups', 'Gaming']

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
            <p className="text-gray-600 dark:text-slate-300">
              {isEditing ? 'Edit your profile information' : 'View and manage your profile'}
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <Button onClick={startEditing} className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={cancelEditing}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button 
                  onClick={saveChanges} 
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info & Profile Picture */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative inline-block">
                  {displayData?.profilePictureUrl ? (
                    <Image 
                      src={displayData.profilePictureUrl} 
                      alt="Profile" 
                      width={120}
                      height={120}
                      className="w-30 h-30 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-30 h-30 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="space-y-2">
                    <FileUpload
                      accept="image/*"
                      maxSize="5MB"
                      fileType="profile-image"
                      onUploadComplete={(result) => {
                        setEditData(prev => ({ ...prev, profilePictureUrl: result.ufsUrl }))
                        toast.success('Profile picture uploaded!')
                      }}
                    />
                    <p className="text-xs text-gray-500">Upload a new profile picture (max 5MB)</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editData.name || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        type="email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+216 12345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                      <Input
                        id="linkedinUrl"
                        value={editData.linkedinUrl || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/yourname"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Name</label>
                      <p className="text-gray-900 dark:text-white">
                        {displayData?.name || `${user.firstName} ${user.lastName}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                      <p className="text-gray-900 dark:text-white">
                        {displayData?.email || user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                    {displayData?.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Phone</label>
                        <p className="text-gray-900 dark:text-white">{displayData.phone}</p>
                      </div>
                    )}
                    {displayData?.linkedinUrl && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">LinkedIn</label>
                        <a 
                          href={displayData.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Member Since</label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(displayData?.createdAt || user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* CV Section */}
            <Card>
              <CardHeader>
                <CardTitle>CV/Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div>
                    <Label>Upload New CV</Label>
                    <FileUpload
                      accept=".pdf,application/pdf"
                      maxSize="8MB"
                      fileType="cv"
                      onUploadComplete={(result) => {
                        setEditData(prev => ({ ...prev, cvUrl: result.ufsUrl }))
                        toast.success('CV uploaded successfully!')
                      }}
                    />
                    {editData.cvUrl && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700 dark:text-green-300">
                            ✓ New CV uploaded
                          </span>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(editData.cvUrl, '_blank')}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  displayData?.cvUrl && (
                    <Button 
                      onClick={handleOpenCV}
                      variant="outline" 
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View CV</span>
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Education & Experience */}
          <div className="space-y-6">
            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="education">Education Level</Label>
                      <Select 
                        value={editData.education || ''} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, education: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High School">High School</SelectItem>
                          <SelectItem value="Bachelor's Degree">Bachelor&apos;s Degree</SelectItem>
                          <SelectItem value="Master's Degree">Master&apos;s Degree</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="university">University/Institution</Label>
                      <Input
                        id="university"
                        value={editData.university || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, university: e.target.value }))}
                        placeholder="Your university"
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        value={editData.degree || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, degree: e.target.value }))}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="major">Major/Specialization</Label>
                      <Input
                        id="major"
                        value={editData.major || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, major: e.target.value }))}
                        placeholder="Your specialization"
                      />
                    </div>
                    <div>
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={editData.graduationYear || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, graduationYear: e.target.value }))}
                        placeholder="2024"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {displayData?.education && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Education Level</label>
                        <p className="text-gray-900 dark:text-white">{displayData.education}</p>
                      </div>
                    )}
                    {displayData?.university && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">University</label>
                        <p className="text-gray-900 dark:text-white">{displayData.university}</p>
                      </div>
                    )}
                    {displayData?.degree && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Degree</label>
                        <p className="text-gray-900 dark:text-white">{displayData.degree}</p>
                      </div>
                    )}
                    {displayData?.major && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Major</label>
                        <p className="text-gray-900 dark:text-white">{displayData.major}</p>
                      </div>
                    )}
                    {displayData?.graduationYear && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Graduation Year</label>
                        <p className="text-gray-900 dark:text-white">{displayData.graduationYear}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editData.bio || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                ) : (
                  displayData?.bio ? (
                    <p className="text-gray-900 dark:text-white">{displayData.bio}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No bio added yet</p>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Skills & Preferences */}
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="skillCategory">Skill Category</Label>
                      <Select 
                        value={selectedSkillCategory} 
                        onValueChange={setSelectedSkillCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(SKILLS_CATEGORIES).map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedSkillCategory && (
                      <div className="grid grid-cols-2 gap-2">
                        {SKILLS_CATEGORIES[selectedSkillCategory].map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                              editData.skills?.includes(skill)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}

                    {editData.skills && editData.skills.length > 0 && (
                      <div>
                        <Label>Selected Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editData.skills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  displayData?.skills && Array.isArray(displayData.skills) && displayData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {displayData.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No skills added yet</p>
                  )
                )}
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                            editData.interests?.includes(interest)
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-500'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  displayData?.interests && Array.isArray(displayData.interests) && displayData.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {displayData.interests.map((interest, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No interests added yet</p>
                  )
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Internship Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="lookingFor">Looking For</Label>
                      <Select 
                        value={editData.lookingFor || ''} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, lookingFor: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="What are you looking for?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="part-time">Part-time Job</SelectItem>
                          <SelectItem value="full-time">Full-time Job</SelectItem>
                          <SelectItem value="freelance">Freelance Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="availabilityType">Availability</Label>
                      <Select 
                        value={editData.availabilityType || ''} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, availabilityType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="1-month">Within 1 month</SelectItem>
                          <SelectItem value="3-months">Within 3 months</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferredDuration">Preferred Duration</Label>
                      <Select 
                        value={editData.preferredDuration || ''} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, preferredDuration: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3 months">1-3 months</SelectItem>
                          <SelectItem value="3-6 months">3-6 months</SelectItem>
                          <SelectItem value="6-12 months">6-12 months</SelectItem>
                          <SelectItem value="1+ years">1+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="remotePreference">Remote Work</Label>
                      <Select 
                        value={editData.remotePreference || ''} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, remotePreference: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-site">On-site Only</SelectItem>
                          <SelectItem value="remote">Remote Only</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="no-preference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    {displayData?.lookingFor && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Looking For</label>
                        <p className="text-gray-900 dark:text-white capitalize">{displayData.lookingFor}</p>
                      </div>
                    )}
                    {displayData?.availabilityType && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Availability</label>
                        <p className="text-gray-900 dark:text-white">{displayData.availabilityType}</p>
                      </div>
                    )}
                    {displayData?.preferredDuration && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Duration</label>
                        <p className="text-gray-900 dark:text-white">{displayData.preferredDuration}</p>
                      </div>
                    )}
                    {displayData?.remotePreference && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Remote Work</label>
                        <p className="text-gray-900 dark:text-white">{displayData.remotePreference}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        {!isEditing && (
          <div className="mt-8">
            <Button
              variant="secondary"
              onClick={() => {
                const from = searchParams.get('from')
                if (from) {
                  router.push(from)
                } else {
                  router.push('/dashboard')
                }
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        )}
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
