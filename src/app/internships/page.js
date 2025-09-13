'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Search, MapPin, Clock, Users, Calendar, BookOpen, Briefcase } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading-spinner'

export default function InternshipsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [filteredInternships, setFilteredInternships] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedField, setSelectedField] = useState('all')
  const [userApplications, setUserApplications] = useState(new Set())
  const [isAdmin, setIsAdmin] = useState(false)

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {}
    }

    if (user) {
      checkAdminStatus()
    }
  }, [user])

  // Check if user has completed onboarding
  useEffect(() => {
    if (!user) return

    const checkProfileCompletion = async () => {
      try {
        const response = await fetch('/api/profile/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (!data.profileCompleted) {
            // User hasn't completed onboarding, redirect to onboarding
            router.push('/onboarding')
            return
          }
        }
      } catch (error) {}
      
      setIsLoading(false)
    }

    checkProfileCompletion()
  }, [user, router])

  // Fetch internships and user applications
  useEffect(() => {
    if (isLoading) return

    const fetchData = async () => {
      try {
        // Fetch internships
        const internshipsResponse = await fetch('/api/internships')
        if (internshipsResponse.ok) {
          const internshipsData = await internshipsResponse.json()
          setInternships(internshipsData.internships || [])
          setFilteredInternships(internshipsData.internships || [])
        }

        // Fetch user applications
        const applicationsResponse = await fetch('/api/applications')
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          const appliedInternshipIds = new Set(
            applicationsData.applications?.map(app => app.internshipId) || []
          )
          setUserApplications(appliedInternshipIds)
        }
      } catch (error) {}
    }

    fetchData()
  }, [isLoading])

  // Filter internships based on search and field
  useEffect(() => {
    let filtered = internships

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(internship => 
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by field (basic categorization)
    if (selectedField !== 'all') {
      filtered = filtered.filter(internship => {
        const title = internship.title.toLowerCase()
        switch (selectedField) {
          case 'technology':
            return title.includes('developer') || title.includes('software') || title.includes('tech') || title.includes('programming')
          case 'design':
            return title.includes('design') || title.includes('ui') || title.includes('ux')
          case 'marketing':
            return title.includes('marketing') || title.includes('social') || title.includes('content')
          case 'data':
            return title.includes('data') || title.includes('analytics') || title.includes('machine learning') || title.includes('research')
          default:
            return true
        }
      })
    }

    setFilteredInternships(filtered)
  }, [searchTerm, selectedField, internships])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleApply = async (internshipId) => {
    // Redirect to the apply page instead of directly applying
    router.push(`/internships/${internshipId}/apply`)
  }

  const isAlreadyApplied = (internshipId) => {
    return userApplications.has(internshipId)
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Internships" 
        subtitle="Discovering available internship opportunities for you..."
        variant="primary"
        icon={Briefcase}
      />
    )
  }

  return (
    <>
      <SignedIn>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {isAdmin ? 'Manage Internships' : 'Available Internships'}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {isAdmin 
                    ? 'Manage and oversee all internship opportunities in the system.'
                    : 'Discover internship opportunities that match your interests and skills.'
                  }
                </p>
              </div>
              
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => router.push('/admin')}
                    variant="outline"
                  >
                    Back to Admin Dashboard
                  </Button>
                  <Button>
                    Add New Internship
                  </Button>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search internships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={selectedField === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedField('all')}
                  size="sm"
                  className={selectedField === 'all' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                >
                  All Fields
                </Button>
                <Button 
                  variant={selectedField === 'technology' ? 'default' : 'outline'}
                  onClick={() => setSelectedField('technology')}
                  size="sm"
                  className={selectedField === 'technology' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                >
                  Technology
                </Button>
                <Button 
                  variant={selectedField === 'design' ? 'default' : 'outline'}
                  onClick={() => setSelectedField('design')}
                  size="sm"
                  className={selectedField === 'design' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                >
                  Design
                </Button>
                <Button 
                  variant={selectedField === 'marketing' ? 'default' : 'outline'}
                  onClick={() => setSelectedField('marketing')}
                  size="sm"
                  className={selectedField === 'marketing' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                >
                  Marketing
                </Button>
                <Button 
                  variant={selectedField === 'data' ? 'default' : 'outline'}
                  onClick={() => setSelectedField('data')}
                  size="sm"
                  className={selectedField === 'data' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                >
                  Data & Analytics
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                {filteredInternships.length} {filteredInternships.length === 1 ? 'internship' : 'internships'} found
              </p>
            </div>

            {/* Internships Grid */}
            {filteredInternships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInternships.map((internship) => (
                  <Card key={internship.id} className="flex flex-col h-full hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg leading-tight text-slate-900 dark:text-white">{internship.title}</CardTitle>
                        <Badge variant={internship.spotsRemaining > 0 ? 'default' : 'secondary'} className={
                          internship.spotsRemaining > 0 
                            ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300"
                        }>
                          {internship.spotsRemaining > 0 ? 'Open' : 'Full'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                        {internship.description.length > 150 
                          ? `${internship.description.substring(0, 150)}...` 
                          : internship.description
                        }
                      </CardDescription>
                      
                      {/* Internship Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="h-4 w-4 mr-2" />
                          {internship.duration} weeks
                        </div>
                        
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <Users className="h-4 w-4 mr-2" />
                          {internship.spotsRemaining} of {internship.capacity} spots available
                        </div>
                        
                        {internship.tasksCount > 0 && (
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <BookOpen className="h-4 w-4 mr-2" />
                            {internship.tasksCount} learning tasks
                          </div>
                        )}
                      </div>

                      {/* Learning Path Info */}
                      {internship.learningPath && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                          <h4 className="font-medium text-sm text-blue-900 dark:text-blue-200 mb-1">
                            Learning Path: {internship.learningPath.title}
                          </h4>
                          {internship.learningPath.description && (
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              {internship.learningPath.description}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Apply Button */}
                      <Button 
                        onClick={() => handleApply(internship.id)}
                        disabled={
                          internship.spotsRemaining === 0 || 
                          isAlreadyApplied(internship.id)
                        }
                        className={`w-full ${
                          isAlreadyApplied(internship.id) 
                            ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600' 
                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        }`}
                      >
                        {isAlreadyApplied(internship.id)
                          ? 'Applied'
                          : internship.spotsRemaining === 0 
                            ? 'Full' 
                            : 'Apply Now'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No internships found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedField('all')
                  }}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
