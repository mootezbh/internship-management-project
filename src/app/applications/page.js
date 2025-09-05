'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Building, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading-spinner'

export default function ApplicationsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

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

  // Fetch applications
  useEffect(() => {
    if (isLoading) return

    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications')
        if (response.ok) {
          const data = await response.json()
          setApplications(data.applications || [])
          setFilteredApplications(data.applications || [])
        }
      } catch (error) {}
    }

    fetchApplications()
  }, [isLoading])

  // Filter applications by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications)
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter.toUpperCase()))
    }
  }, [statusFilter, applications])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
          <AlertCircle className="h-3 w-3" />
          Pending
        </Badge>
      case 'UNDER_REVIEW':
        return <Badge variant="default" className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
          <Clock className="h-3 w-3" />
          Under Review
        </Badge>
      case 'ACCEPTED':
        return <Badge variant="success" className="flex items-center gap-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
          <CheckCircle className="h-3 w-3" />
          Accepted
        </Badge>
      case 'REJECTED':
        return <Badge variant="destructive" className="flex items-center gap-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Your Applications" 
        subtitle="Retrieving your internship applications and their current status..."
        variant="primary"
        icon={FileText}
      />
    )
  }

  return (
    <>
      <SignedIn>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                My Applications
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Track your internship application status and progress.
              </p>
            </div>

            {/* Status Filters */}
            <div className="mb-6 flex gap-2 flex-wrap">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className={statusFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
              >
                All Applications
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
                className={statusFilter === 'pending' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === 'under_review' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('under_review')}
                size="sm"
                className={statusFilter === 'under_review' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
              >
                Under Review
              </Button>
              <Button 
                variant={statusFilter === 'accepted' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('accepted')}
                size="sm"
                className={statusFilter === 'accepted' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
              >
                Accepted
              </Button>
              <Button 
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
                size="sm"
                className={statusFilter === 'rejected' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
              >
                Rejected
              </Button>
            </div>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg mb-1 text-slate-900 dark:text-white">
                            {application.internship.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.internship.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {application.internship.duration} weeks
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {application.internship.field}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(application.status)}
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Applied {formatDate(application.appliedAt)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <p>Application ID: {application.id}</p>
                        </div>
                        
                        {application.status === 'ACCEPTED' && (
                          <Button 
                            onClick={() => router.push(`/learning-path/${application.internship.id}`)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                          >
                            View Learning Path
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter.replace('_', ' ')} applications`}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {statusFilter === 'all' 
                    ? 'Your internship applications will appear here once you start applying.'
                    : 'Try adjusting your filter or check back later.'
                  }
                </p>
                <Button 
                  onClick={() => router.push('/internships')}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Browse Internships
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
