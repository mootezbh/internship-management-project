'use client'

import { useState, useEffect } from 'react'
import { SignedIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Eye,
  Check,
  X,
  Clock,
  ExternalLink,
  User,
  FileText,
  Building,
  Calendar,
  Target,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  CheckSquare
} from 'lucide-react'
import { toast } from "sonner"
import { PageLoading } from '@/components/ui/loading-spinner'

// Badge component
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

// Dialog components
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto border border-slate-200 dark:border-slate-700 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ children }) => <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">{children}</div>
const DialogTitle = ({ children }) => <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{children}</h2>
const DialogContent = ({ children }) => <div className="px-6 py-4">{children}</div>

export default function AdminTaskReviewPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [filteredSubmissions, setFilteredSubmissions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    status: '',
    feedback: ''
  })

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Check if user is admin
        const adminCheckRes = await fetch('/api/admin/check')
        const adminCheck = await adminCheckRes.json()
        
        if (!adminCheckRes.ok || !adminCheck.isAdmin) {
          router.push('/dashboard')
          return
        }

        // Fetch submissions
        const submissionsRes = await fetch('/api/admin/submissions')
        if (submissionsRes.ok) {
          const data = await submissionsRes.json()
          setSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
          setFilteredSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
        } else {
          const errorData = await submissionsRes.json()
          toast.error(errorData.error || 'Failed to load submissions')
        }
      } catch (error) {
        toast.error('Failed to load submissions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  // Filter submissions
  useEffect(() => {
    if (!Array.isArray(submissions)) return
    
    let filtered = submissions

    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.task?.learningPath?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchTerm, statusFilter])

  const handleReviewSubmission = (submission) => {
    setSelectedSubmission(submission)
    setReviewForm({
      status: submission.status,
      feedback: submission.feedback || ''
    })
    setShowReviewDialog(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/admin/task-submissions/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      })

      if (response.ok) {
        toast.success('Submission review completed successfully!')
        setShowReviewDialog(false)
        
        // Refresh submissions
        const submissionsRes = await fetch('/api/admin/submissions')
        if (submissionsRes.ok) {
          const data = await submissionsRes.json()
          setSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
          setFilteredSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    }
  }

  const handleQuickAction = async (submissionId, status) => {
    try {
      const response = await fetch(`/api/admin/task-submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback: '' })
      })

      if (response.ok) {
        toast.success(`Submission ${status.toLowerCase()} successfully!`)
        
        // Refresh submissions
        const submissionsRes = await fetch('/api/admin/submissions')
        if (submissionsRes.ok) {
          const data = await submissionsRes.json()
          setSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
          setFilteredSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update submission')
      }
    } catch (error) {
      toast.error('Failed to update submission')
    }
  }

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      const submissionsRes = await fetch('/api/admin/submissions')
      if (submissionsRes.ok) {
        const data = await submissionsRes.json()
        setSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
        setFilteredSubmissions(Array.isArray(data.submissions) ? data.submissions : [])
        toast.success('Data refreshed successfully!')
      } else {
        const errorData = await submissionsRes.json()
        toast.error(errorData.error || 'Failed to refresh data')
      }
    } catch (error) {toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Review</Badge>
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>
      case 'REQUIRES_CHANGES':
        return <Badge variant="destructive">Needs Changes</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDaysOverdue = (submittedAt, deadlineOffset) => {
    // Calculate deadline based on when the task was submitted and deadline offset
    const submissionDate = new Date(submittedAt)
    const deadlineDate = new Date(submissionDate.getTime() + (deadlineOffset * 24 * 60 * 60 * 1000))
    const today = new Date()
    const diffTime = today - deadlineDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Task Submissions" 
        subtitle="Fetching submitted tasks and preparing the review interface..."
        variant="primary"
        icon={CheckSquare}
      />
    )
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin Dashboard</span>
              </Button>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Task Review</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-4">Review student task submissions and provide feedback</p>
            
            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-1">How Task Review Works</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Students submit their GitHub repositories for tasks. You can review their code, provide feedback, 
                      and approve or request changes. Approved tasks unlock the next task in the learning path.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{submissions.length}</p>
                    <p className="text-slate-600 dark:text-slate-400">Total Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {submissions.filter(sub => sub.status === 'PENDING').length}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {submissions.filter(sub => sub.status === 'APPROVED').length}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {submissions.filter(sub => sub.status === 'REQUIRES_CHANGES').length}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">Needs Changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="text-slate-900 dark:text-white">Search Submissions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="search"
                      placeholder="Search by student, task, or learning path..."
                      className="pl-10 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status-filter" className="text-slate-900 dark:text-white">Status</Label>
                  <select
                    id="status-filter"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REQUIRES_CHANGES">Needs Changes</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                    className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400">
              {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submission' : 'submissions'} found
            </p>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-6">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{submission.user?.name || 'Unknown User'}</h3>
                            <p className="text-slate-600 dark:text-slate-300">{submission.user?.email || 'No email'}</p>
                          </div>
                          {getStatusBadge(submission.status)}
                          {submission.task?.deadlineOffset && getDaysOverdue(submission.submittedAt, submission.task.deadlineOffset) > 0 && (
                            <Badge variant="destructive">
                              {getDaysOverdue(submission.submittedAt, submission.task.deadlineOffset)} days overdue
                            </Badge>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-white">{submission.task?.title || 'Unknown Task'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                            <Building className="h-4 w-4" />
                            <span>{submission.task?.learningPath?.title || 'Unknown Learning Path'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Deadline: {submission.task?.deadlineOffset || 'Unknown'} days from task start</span>
                          </div>
                        </div>

                        {submission.githubUrl && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium text-slate-900 dark:text-white">GitHub Repository:</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(submission.githubUrl, '_blank')}
                              className="ml-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Repository
                            </Button>
                          </div>
                        )}

                        {submission.feedback && (
                          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              <span className="text-sm font-medium text-slate-900 dark:text-white">Previous Feedback:</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{submission.feedback}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewSubmission(submission)}
                          className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        {submission.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleQuickAction(submission.id, 'APPROVED')}
                              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleQuickAction(submission.id, 'REQUIRES_CHANGES')}
                              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Request Changes
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Submissions Found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {Array.isArray(submissions) && submissions.length === 0 
                    ? "No task submissions have been made yet. Students need to complete tasks and submit their GitHub repositories." 
                    : "No submissions match your current filters."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Review Dialog */}
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review Task Submission</DialogTitle>
              </DialogHeader>
              {selectedSubmission && (
                <div className="space-y-6">
                  {/* Submission Details */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Submission Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Student:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedSubmission.user?.name || 'Unknown User'}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Task:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedSubmission.task?.title || 'Unknown Task'}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Learning Path:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedSubmission.task?.learningPath?.title || 'Unknown Path'}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Submitted:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{new Date(selectedSubmission.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Deadline:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{selectedSubmission.task?.deadlineOffset || 'Unknown'} days from task start</p>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Current Status:</span>
                        {getStatusBadge(selectedSubmission.status)}
                      </div>
                    </div>
                  </div>

                  {/* Submission Content */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Submission Content</h4>
                    
                    {/* GitHub Repository */}
                    {selectedSubmission.githubUrl && (
                      <div className="mb-4">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">GitHub Repository:</span>
                        <div className="mt-1">
                          <Button
                            variant="outline"
                            onClick={() => window.open(selectedSubmission.githubUrl, '_blank')}
                            className="flex items-center space-x-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Open GitHub Repository</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Other Submission Data */}
                    {selectedSubmission.feedback && (() => {
                      try {
                        const submissionData = JSON.parse(selectedSubmission.feedback);
                        return (
                          <div className="space-y-4">
                            {submissionData.github && submissionData.github !== selectedSubmission.githubUrl && (
                              <div>
                                <span className="text-slate-600 dark:text-slate-400 text-sm">GitHub Link:</span>
                                <div className="mt-1">
                                  <Button
                                    variant="outline"
                                    onClick={() => window.open(submissionData.github, '_blank')}
                                    className="flex items-center space-x-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Open GitHub Link</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {submissionData.text && (
                              <div>
                                <span className="text-slate-600 dark:text-slate-400 text-sm">Text Response:</span>
                                <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                  <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{submissionData.text}</p>
                                </div>
                              </div>
                            )}
                            
                            {submissionData.pdf && (
                              <div>
                                <span className="text-slate-600 dark:text-slate-400 text-sm">PDF Submission:</span>
                                <div className="mt-1">
                                  <Button
                                    variant="outline"
                                    onClick={() => window.open(submissionData.pdf, '_blank')}
                                    className="flex items-center space-x-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                  >
                                    <FileText className="h-4 w-4" />
                                    <span>View PDF</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {submissionData.image && (
                              <div>
                                <span className="text-slate-600 dark:text-slate-400 text-sm">Image Submission:</span>
                                <div className="mt-1">
                                  <Button
                                    variant="outline"
                                    onClick={() => window.open(submissionData.image, '_blank')}
                                    className="flex items-center space-x-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>View Image</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } catch (e) {
                        // If feedback is not JSON, display as text
                        return selectedSubmission.feedback && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400 text-sm">Previous Feedback:</span>
                            <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                              <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                    
                    {/* Show message if no submission content */}
                    {!selectedSubmission.githubUrl && !selectedSubmission.feedback && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">No submission content available</p>
                      </div>
                    )}
                  </div>

                  {/* Task Description */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Task Description</h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{selectedSubmission.task?.description || 'No description available'}</p>
                    </div>
                  </div>

                  {/* Review Form */}
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label htmlFor="review-status" className="text-slate-900 dark:text-white">Review Decision</Label>
                      <select
                        id="review-status"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={reviewForm.status}
                        onChange={(e) => setReviewForm({...reviewForm, status: e.target.value})}
                        required
                      >
                        <option value="">Select Decision</option>
                        <option value="PENDING">Keep Pending</option>
                        <option value="APPROVED">Approve (Unlock Next Task)</option>
                        <option value="REQUIRES_CHANGES">Request Changes</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="review-feedback" className="text-slate-900 dark:text-white">Feedback</Label>
                      <Textarea
                        id="review-feedback"
                        value={reviewForm.feedback}
                        onChange={(e) => setReviewForm({...reviewForm, feedback: e.target.value})}
                        placeholder="Provide detailed feedback to help the student improve..."
                        rows={6}
                        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push('/admin')}
                        className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SignedIn>
  )
}
