'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Users, Building, CheckCircle, XCircle, Timer, TrendingUp, BookOpen, FileText, Target, LayoutDashboard, Plus, Eye } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading-spinner'
// ...removed AdminLayout import...

export default function AdminDashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [internships, setInternships] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    totalInternships: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0
  })

  useEffect(() => {
    if (!user) return

    const fetchAdminData = async () => {
      try {
        // Check if user is admin via API
        const adminCheckRes = await fetch('/api/admin/check')
        const adminCheck = await adminCheckRes.json()
        
        if (!adminCheckRes.ok || !adminCheck.isAdmin) {
          router.push('/dashboard')
          return
        }

        // Fetch admin data from new stats endpoint
        const [statsRes, applicationsRes, internshipsRes, submissionsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/applications'),
          fetch('/api/internships'),
          fetch('/api/admin/submissions')
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats || {})
          setApplications(data.recentApplications || [])
        }

        if (internshipsRes.ok) {
          const data = await internshipsRes.json()
          setInternships(data || [])
        }

        if (submissionsRes.ok) {
          const data = await submissionsRes.json()
          setSubmissions(data.submissions || [])
        }
      } catch (error) {
        toast.error('Failed to load admin data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [user, router])

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(`Application ${action}ed successfully!`)
        // Refresh applications
        const applicationsRes = await fetch('/api/admin/applications')
        if (applicationsRes.ok) {
          const data = await applicationsRes.json()
          setApplications(data.applications || [])
        }
      } else {
        toast.error('Failed to update application')
      }
    } catch (error) {
      toast.error('Failed to update application')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"><Timer className="w-3 h-3 mr-1" />Pending</span>
      case 'ACCEPTED':
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700"><CheckCircle className="w-3 h-3 mr-1" />Accepted</span>
      case 'REJECTED':
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</span>
      default:
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600">{status}</span>
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Admin Dashboard" 
        subtitle="Preparing your administrative overview and statistics..."
        variant="primary"
        icon={LayoutDashboard}
      />
    )
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => router.push('/admin/internships/create')}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Internship
                  </Button>
                  <Button 
                    onClick={() => router.push('/admin/learning-paths/create')}
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    New Learning Path
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Manage internships, applications, and user activities</p>
            </div>
            {/* Main Content */}
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Registered users in system
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Applications</CardTitle>
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalApplications}</div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {stats.pendingApplications} pending review
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Internships</CardTitle>
                <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalInternships}</div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Active opportunities
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Submissions</CardTitle>
                <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.totalSubmissions}</div>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  {stats.pendingSubmissions} awaiting review
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm" onClick={() => router.push('/admin/users')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">User Management</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">View and manage user accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm" onClick={() => router.push('/admin/internships')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Manage Internships</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Create and edit internship offers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm" onClick={() => router.push('/admin/learning-paths')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Learning Paths</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Create and manage learning paths</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm" onClick={() => router.push('/admin/applications')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                        <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Application Review</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Accept or reject applications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm" onClick={() => router.push('/admin/internship-management')}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Internship Management</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Monitor progress, manage deadlines, review submissions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Pending Applications */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Applications</h2>
                <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">{applications.filter(app => app.status === 'PENDING').length} requiring review</Badge>
              </div>

              {applications.filter(app => app.status === 'PENDING').length > 0 ? (
                <div className="space-y-4">
                  {applications
                    .filter(app => app.status === 'PENDING')
                    .map((application) => (
                      <Card key={application.id} className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg text-slate-900 dark:text-white">{application.internship.title}</CardTitle>
                              <CardDescription className="mt-1 text-slate-600 dark:text-slate-400">
                                Applied by {application.user.fullName || application.user.firstName || 'Unknown'} • {formatDate(application.appliedAt)}
                              </CardDescription>
                            </div>
                            {getStatusBadge(application.status)}
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                <strong className="text-slate-900 dark:text-white">Applicant:</strong> {application.user.email}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                <strong className="text-slate-900 dark:text-white">Education:</strong> {application.user.education || 'Not provided'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                <strong className="text-slate-900 dark:text-white">Skills:</strong> {application.user.skills || 'Not provided'}
                              </p>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleApplicationAction(application.id, 'accept')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                              >
                                Accept
                              </Button>
                              <Button 
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                size="sm"
                                variant="outline"
                                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 dark:text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
                    <p className="text-slate-600 dark:text-slate-400">No pending applications to review at this time.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* All Applications */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All Applications</h2>
              
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-slate-900 dark:text-white">{application.internship.title}</CardTitle>
                            <CardDescription className="mt-1 text-slate-600 dark:text-slate-400">
                              {application.user.fullName || application.user.firstName || 'Unknown'} • {formatDate(application.appliedAt)}
                            </CardDescription>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-900 dark:text-white">Email:</strong> {application.user.email}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-900 dark:text-white">Education:</strong> {application.user.education || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-900 dark:text-white">Skills:</strong> {application.user.skills || 'Not provided'}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-900 dark:text-white">Application Date:</strong> {formatDate(application.appliedAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Applications Yet</h3>
                    <p className="text-slate-600 dark:text-slate-400">Applications will appear here once users start applying.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          {/* ...existing code... */}
          {/* End of main content */}
        </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      </>
  )
}
