'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Github,
  User,
  Calendar,
  FileText,
  BookOpen,
  Star,
  MessageSquare,
  ExternalLink,
  Target,
  Award,
  TrendingUp
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

export default function AdminSubmissionReviewPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const submissionId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const [application, setApplication] = useState(null)
  const [userSubmissions, setUserSubmissions] = useState([])
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    action: '',
    feedback: '',
    grade: ''
  })

  useEffect(() => {
    if (!user || !submissionId) return

    const fetchSubmissionData = async () => {
      try {
        // Check if user is admin
        const adminEmails = ['admin@example.com', 'tensorphobia@example.com']
        const isAdmin = adminEmails.includes(user.emailAddresses[0]?.emailAddress || '')
        
        if (!isAdmin) {
          router.push('/dashboard')
          return
        }

        const response = await fetch(`/api/admin/submissions/${submissionId}`)
        if (response.ok) {
          const data = await response.json()
          setSubmission(data.submission)
          setApplication(data.application)
          setUserSubmissions(data.userSubmissions || [])
        } else {
          toast.error('Failed to load submission details')
          router.push('/admin/submissions')
        }
      } catch (error) {toast.error('Failed to load submission details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubmissionData()
  }, [user, submissionId, router])

  const handleReviewSubmission = async (action) => {
    if (!action) return

    // Validate required feedback for certain actions
    if ((action === 'request_changes' || action === 'reject') && !reviewForm.feedback.trim()) {
      toast.error('Please provide feedback when requesting changes or rejecting')
      return
    }

    setIsReviewing(true)

    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          feedback: reviewForm.feedback.trim(),
          grade: reviewForm.grade.trim()
        }),
      })

      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmission(updatedSubmission)
        
        // Clear form
        setReviewForm({ action: '', feedback: '', grade: '' })
        
        const actionText = action === 'approve' ? 'approved' : 
                          action === 'reject' ? 'rejected' : 
                          'marked for changes'
        toast.success(`Submission ${actionText} successfully!`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to review submission')
      }
    } catch (error) {toast.error('Failed to review submission. Please try again.')
    } finally {
      setIsReviewing(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'REQUIRES_CHANGES':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-slate-400" />
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateUserProgress = () => {
    if (!userSubmissions.length) return 0
    const approvedCount = userSubmissions.filter(sub => sub.status === 'APPROVED').length
    return Math.round((approvedCount / userSubmissions.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading submission details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Submission Not Found</h3>
            <p className="text-slate-600 mb-4">
              The submission you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Button onClick={() => router.push('/admin/submissions')}>
              Back to Submissions
            </Button>
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
                onClick={() => router.push('/admin/submissions')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submissions
              </Button>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Review Submission
                  </h1>
                  <p className="text-slate-600">
                    {submission.task.title} • Task {submission.task.order}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(submission.status)}
                  {getStatusBadge(submission.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Submission Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Github className="h-5 w-5" />
                      Submission Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">GitHub Repository</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <a 
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {submission.githubUrl}
                          </a>
                          <Button size="sm" variant="outline" asChild>
                            <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Submitted</Label>
                          <div className="mt-1 flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatDate(submission.submittedAt)}
                          </div>
                        </div>

                        {submission.reviewedAt && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Last Reviewed</Label>
                            <div className="mt-1 flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {formatDate(submission.reviewedAt)}
                            </div>
                          </div>
                        )}
                      </div>

                      {submission.feedback && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Previous Feedback</Label>
                          <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">{submission.feedback}</p>
                          </div>
                        </div>
                      )}

                      {submission.grade && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Grade</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{submission.grade}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Task Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Task Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Task Title</Label>
                        <p className="mt-1 text-sm">{submission.task.title}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700">Task Order</Label>
                        <p className="mt-1 text-sm">Task {submission.task.order}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700">Learning Path</Label>
                        <p className="mt-1 text-sm">{submission.task.learningPath.title}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700">Internship</Label>
                        <p className="mt-1 text-sm">
                          {submission.task.learningPath.internships[0]?.title} - {submission.task.learningPath.internships[0]?.company}
                        </p>
                      </div>

                      {submission.task.content && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Task Instructions</Label>
                          <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{submission.task.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Review Actions */}
                {submission.status === 'PENDING' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Review Submission
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="feedback">Feedback (Optional for approval, Required for rejection/changes)</Label>
                          <Textarea
                            id="feedback"
                            placeholder="Provide detailed feedback about the submission..."
                            value={reviewForm.feedback}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                            rows={4}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="grade">Grade (Optional)</Label>
                          <input
                            id="grade"
                            type="text"
                            placeholder="e.g., A+, 95/100, Excellent"
                            value={reviewForm.grade}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, grade: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleReviewSubmission('approve')}
                            disabled={isReviewing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isReviewing ? 'Processing...' : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>

                          <Button 
                            onClick={() => handleReviewSubmission('request_changes')}
                            disabled={isReviewing}
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            {isReviewing ? 'Processing...' : (
                              <>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Request Changes
                              </>
                            )}
                          </Button>

                          <Button 
                            onClick={() => handleReviewSubmission('reject')}
                            disabled={isReviewing}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            {isReviewing ? 'Processing...' : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Student Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Name</Label>
                        <p className="mt-1 text-sm">{submission.user.fullName || submission.user.firstName || 'Unknown'}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700">Email</Label>
                        <p className="mt-1 text-sm">{submission.user.email}</p>
                      </div>

                      {submission.user.education && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Education</Label>
                          <p className="mt-1 text-sm">{submission.user.education}</p>
                        </div>
                      )}

                      {submission.user.skills && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Skills</Label>
                          <p className="mt-1 text-sm">{submission.user.skills}</p>
                        </div>
                      )}

                      {submission.user.cvUrl && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">CV</Label>
                          <div className="mt-1">
                            <Button size="sm" variant="outline" asChild>
                              <a href={submission.user.cvUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-2" />
                                Open CV
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Student Progress */}
                {userSubmissions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Student Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{calculateUserProgress()}%</div>
                          <div className="text-sm text-slate-500">Overall Progress</div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Approved Tasks</span>
                            <span>{userSubmissions.filter(s => s.status === 'APPROVED').length}/{userSubmissions.length}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${calculateUserProgress()}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">All Submissions</h4>
                          {userSubmissions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between text-xs">
                              <span>Task {sub.task.order}: {sub.task.title}</span>
                              {sub.status === 'APPROVED' ? (
                                <Badge variant="success">✓</Badge>
                              ) : sub.status === 'PENDING' ? (
                                <Badge variant="warning">⏳</Badge>
                              ) : sub.status === 'REQUIRES_CHANGES' ? (
                                <Badge variant="destructive">↻</Badge>
                              ) : (
                                <Badge variant="destructive">✗</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
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
