'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Github,
  User,
  Calendar,
  Filter,
  Search,
  Eye,
  ArrowLeft,
  TrendingUp,
  Users,
  Timer,
  Target
} from 'lucide-react'
import { toast } from "sonner"

// Temporary inline Badge component
const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variantClasses = {
    default: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300",
    success: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    warning: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    destructive: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
  }
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default function AdminSubmissionsPage() {
  const { user } = useUser()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({
    status: 'ALL',
    search: '',
    internshipId: ''
  })
  const [internships, setInternships] = useState([])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Check if user is admin via API
        const adminCheckRes = await fetch('/api/admin/check')
        const adminCheck = await adminCheckRes.json()
        
        if (!adminCheckRes.ok || !adminCheck.isAdmin) {
          router.push('/dashboard')
          return
        }

        // Fetch submissions and internships in parallel
        const [submissionsRes, internshipsRes] = await Promise.all([
          fetch('/api/admin/submissions'),
          fetch('/api/internships')
        ])

        if (submissionsRes.ok) {
          const data = await submissionsRes.json()
          setSubmissions(data.submissions || [])
          setStats(data.stats || {})
        }

        if (internshipsRes.ok) {
          const data = await internshipsRes.json()
          setInternships(data.internships || [])
        }
      } catch (error) {toast.error('Failed to load submissions data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const filteredSubmissions = submissions.filter(submission => {
    // Status filter
    if (filters.status !== 'ALL' && submission.status !== filters.status) {
      return false
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesUser = submission.user.fullName?.toLowerCase().includes(searchTerm) ||
                         submission.user.firstName?.toLowerCase().includes(searchTerm) ||
                         submission.user.email?.toLowerCase().includes(searchTerm)
      const matchesTask = submission.task.title?.toLowerCase().includes(searchTerm)
      const matchesInternship = submission.task.learningPath.internships.some(
        internship => internship.title?.toLowerCase().includes(searchTerm) ||
                     internship.company?.toLowerCase().includes(searchTerm)
      )
      
      if (!matchesUser && !matchesTask && !matchesInternship) {
        return false
      }
    }

    // Internship filter
    if (filters.internshipId) {
      const hasInternship = submission.task.learningPath.internships.some(
        internship => internship.id === filters.internshipId
      )
      if (!hasInternship) {
        return false
      }
    }

    return true
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'REQUIRES_CHANGES':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Review</Badge>
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      case 'REQUIRES_CHANGES':
        return <Badge variant="destructive">Requires Changes</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewSubmission = (submissionId) => {
    router.push(`/admin/submissions/${submissionId}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading submissions...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SignedIn>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Button>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Task Submissions Review
              </h1>
              <p className="text-slate-600">
                Review and provide feedback on student task submissions
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-slate-900">{stats.total || 0}</p>
                      <p className="text-slate-600">Total Submissions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Timer className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending || 0}</p>
                      <p className="text-slate-600 dark:text-slate-400">Pending Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.approved || 0}</p>
                      <p className="text-slate-600 dark:text-slate-400">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.requiresChanges || 0}</p>
                      <p className="text-slate-600 dark:text-slate-400">Needs Changes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <select
                      id="status-filter"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="REQUIRES_CHANGES">Requires Changes</option>
                    </select>
                  </div>

                  {/* Internship Filter */}
                  <div>
                    <Label htmlFor="internship-filter">Internship</Label>
                    <select
                      id="internship-filter"
                      value={filters.internshipId}
                      onChange={(e) => setFilters(prev => ({ ...prev, internshipId: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Internships</option>
                      {internships.map(internship => (
                        <option key={internship.id} value={internship.id}>
                          {internship.title} - {internship.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Filter */}
                  <div>
                    <Label htmlFor="search-filter">Search</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="search-filter"
                        type="text"
                        placeholder="Search by student name, task, or internship..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </p>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(submission.status)}
                          <div>
                            <CardTitle className="text-lg">
                              {submission.task.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Task {submission.task.order} • {submission.task.learningPath.internships[0]?.title}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(submission.status)}
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(submission.submittedAt)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm text-slate-700 mb-2">Student Information</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                              <span className="text-slate-900 dark:text-white">{submission.user.fullName || submission.user.firstName || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400">{submission.user.email}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Submission Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Github className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                              <a 
                                href={submission.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                              >
                                {submission.githubUrl}
                              </a>
                            </div>
                            {submission.feedback && (
                              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded text-xs">
                                <strong className="text-yellow-800 dark:text-yellow-200">Feedback:</strong> <span className="text-yellow-700 dark:text-yellow-300">{submission.feedback}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          onClick={() => handleViewSubmission(submission.id)}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review Submission
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Submissions Found</h3>
                    <p className="text-slate-600">
                      {filters.status !== 'ALL' || filters.search || filters.internshipId ? 
                        'No submissions match your current filters.' : 
                        'No task submissions have been made yet.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
