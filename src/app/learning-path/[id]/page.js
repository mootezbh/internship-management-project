'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useRouter, useParams } from 'next/navigation'
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Play,
  FileText,
  Video,
  Code,
  ArrowLeft,
  Target,
  Github,
  AlertCircle,
  Lock,
  Send,
  XCircle,
  Image,
  Link
} from 'lucide-react'
import { toast } from "sonner"
import { PageLoading } from '@/components/ui/loading-spinner'
import TaskRenderer from '@/components/task-builder/TaskRenderer'

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

export default function LearningPathPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const internshipId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [learningPath, setLearningPath] = useState(null)
  const [internship, setInternship] = useState(null)
  const [tasks, setTasks] = useState([])
  const [userProgress, setUserProgress] = useState({})
  const [application, setApplication] = useState(null)
  const [submissions, setSubmissions] = useState({})
  const [submissionForm, setSubmissionForm] = useState({})
  const [submitting, setSubmitting] = useState({})

  // Utility function to get content type icon
  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      case 'IMAGE':
        return <Image className="h-4 w-4" />
      case 'FILE':
        return <FileText className="h-4 w-4" />
      case 'URL':
        return <Link className="h-4 w-4" />
      case 'CODE':
        return <Code className="h-4 w-4" />
      case 'TEXT':
      case 'TEXTAREA':
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  useEffect(() => {
    if (!user || !internshipId) return

    const fetchLearningPathData = async () => {
      try {
        // Check if user has access to this internship's learning path
        const applicationResponse = await fetch('/api/applications')
        if (applicationResponse.ok) {
          const applicationsData = await applicationResponse.json()
          const userApplication = applicationsData.applications?.find(app => app.internshipId === internshipId)
          
          if (!userApplication || userApplication.status !== 'ACCEPTED') {
            toast.error('You do not have access to this learning path')
            router.push('/applications')
            return
          }
          
          setApplication(userApplication)
        }

        // Fetch internship and learning path data
        const internshipResponse = await fetch(`/api/internships/${internshipId}`)
        if (internshipResponse.ok) {
          const internshipData = await internshipResponse.json()
          setInternship(internshipData)
          setLearningPath(internshipData.learningPath)
          setTasks(internshipData.learningPath?.tasks || [])
        }

        // Fetch user progress
        const progressResponse = await fetch(`/api/progress/${internshipId}`)
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          setUserProgress(progressData)
        }

        // Fetch user submissions
        const submissionsResponse = await fetch('/api/submissions')
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json()
          const submissionMap = {}
          submissionsData.submissions?.forEach(submission => {
            submissionMap[submission.taskId] = submission
          })
          setSubmissions(submissionMap)
        }
        
      } catch (error) {toast.error('Failed to load learning path')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLearningPathData()
  }, [user, internshipId, router])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTaskDeadline = (task) => {
    if (!internship?.startDate) return null
    const startDate = new Date(internship.startDate)
    const deadline = new Date(startDate)
    deadline.setDate(deadline.getDate() + task.deadlineOffset)
    return deadline
  }

  const isTaskOverdue = (task) => {
    const deadline = getTaskDeadline(task)
    if (!deadline) return false
    const submission = submissions[task.id]
    const isCompleted = submission && submission.status === 'APPROVED'
    return new Date() > deadline && !isCompleted
  }

  const isTaskAvailable = (task) => {
    // First task is always available
    if (task.order === 1) return true
    
    // Check if previous task is completed
    const previousTask = tasks.find(t => t.order === task.order - 1)
    if (!previousTask) return true
    
    const previousSubmission = submissions[previousTask.id]
    return previousSubmission && previousSubmission.status === 'APPROVED'
  }

  const getTaskStatus = (task) => {
    const submission = submissions[task.id]
    
    if (!submission) {
      if (!isTaskAvailable(task)) return 'locked'
      if (isTaskOverdue(task)) return 'overdue'
      return 'available'
    }
    
    switch (submission.status) {
      case 'PENDING':
        return 'pending'
      case 'APPROVED':
        return 'completed'
      case 'REQUIRES_CHANGES':
        return 'requires_changes'
      default:
        return 'available'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'requires_changes':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'locked':
        return <Lock className="h-5 w-5 text-slate-400" />
      default:
        return <Circle className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>
      case 'requires_changes':
        return <Badge variant="destructive">Requires Changes</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'locked':
        return <Badge variant="secondary">Locked</Badge>
      default:
        return <Badge variant="default">Available</Badge>
    }
  }

  const handleSubmissionChange = (taskId, field, value) => {
    setSubmissionForm(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }))
  }

  const handleSubmitTask = async (taskId) => {
    const formData = submissionForm[taskId]
    
    if (!formData?.githubUrl?.trim()) {
      toast.error('Please provide a GitHub repository URL')
      return
    }

    setSubmitting(prev => ({ ...prev, [taskId]: true }))
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          githubUrl: formData.githubUrl.trim()
        }),
      })

      if (response.ok) {
        const newSubmission = await response.json()
        setSubmissions(prev => ({
          ...prev,
          [taskId]: newSubmission
        }))
        
        // Clear form
        setSubmissionForm(prev => ({
          ...prev,
          [taskId]: { githubUrl: '' }
        }))
        
        toast.success('Task submitted successfully!')
        
        // Refresh progress
        const progressResponse = await fetch(`/api/progress/${internshipId}`)
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          setUserProgress(progressData)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit task')
      }
    } catch (error) {toast.error('Failed to submit task. Please try again.')
    } finally {
      setSubmitting(prev => ({ ...prev, [taskId]: false }))
    }
  }

  const calculateProgress = () => {
    if (!userProgress.totalTasks || userProgress.totalTasks === 0) return 0
    return userProgress.progressPercentage || 0
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Learning Path" 
        subtitle="Preparing your personalized learning journey and tracking progress..."
        variant="primary"
        icon={BookOpen}
      />
    )
  }

  if (!learningPath) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Learning Path Available</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This internship doesn&apos;t have an associated learning path yet.
            </p>
            <Button 
              onClick={() => router.push('/applications')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Back to Applications
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/applications')}
                className="mb-4 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {learningPath.title}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {learningPath.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {internship.title}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {tasks.length} tasks
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {internship.duration} weeks
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calculateProgress()}%
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Complete</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <Progress value={calculateProgress()} className="h-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {userProgress.completedTasks || 0} of {userProgress.totalTasks || tasks.length} tasks completed
                </p>
              </div>
            </div>

            {/* Overall Progress Card */}
            {calculateProgress() > 0 && (
              <Card className="mb-8 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Keep Going! 
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 mb-4">
                      Complete all tasks to finish your internship learning path
                    </p>
                    <div className="max-w-md mx-auto">
                      <Progress value={calculateProgress()} className="h-3" />
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        {userProgress.completedTasks || 0} of {userProgress.totalTasks || tasks.length} tasks completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tasks List */}
            <div className="space-y-6">
              {tasks
                .sort((a, b) => a.order - b.order)
                .map((task, index) => {
                  const status = getTaskStatus(task)
                  const deadline = getTaskDeadline(task)
                  const submission = submissions[task.id]
                  const isAvailable = isTaskAvailable(task)
                  const formData = submissionForm[task.id] || {}

                  return (
                    <Card 
                      key={task.id} 
                      className={`transition-all duration-200 border ${
                        status === 'completed' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50' :
                        status === 'pending' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/50' :
                        status === 'requires_changes' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50' :
                        status === 'overdue' ? 'border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-950/60' :
                        status === 'locked' ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 opacity-60' :
                        'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-950/50 hover:shadow-lg dark:hover:shadow-slate-800/50'
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(status)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-lg">
                                  {task.order}. {task.title}
                                </CardTitle>
                                {getContentTypeIcon(task.contentType)}
                              </div>
                              <CardDescription className="text-sm">
                                {task.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(status)}
                            {deadline && (
                              <div className={`text-xs flex items-center gap-1 ${
                                isTaskOverdue(task) ? 'text-red-600' : 'text-slate-500'
                              }`}>
                                <Calendar className="h-3 w-3" />
                                Due {formatDate(deadline)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Task Content - Always use TaskRenderer for consistent rendering */}
                        <div className="mb-4">
                          {(() => {
                            try {
                              // Try to parse content as JSON first (structured tasks)
                              let taskContent;
                              if (task.content && typeof task.content === 'string') {
                                try {
                                  taskContent = JSON.parse(task.content);
                                } catch {
                                  // If parsing fails, treat as simple content and create appropriate content block
                                  taskContent = [{
                                    id: `task-${task.id}-content`,
                                    type: task.contentType || 'TEXT',
                                    title: 'Task Content',
                                    content: task.contentType === 'VIDEO' ? '' : task.content,
                                    url: task.contentType === 'VIDEO' ? task.content : undefined,
                                    required: true
                                  }];
                                }
                              } else {
                                taskContent = task.content || [];
                              }
                              
                              return (
                                <TaskRenderer 
                                  task={{
                                    ...task,
                                    content: taskContent
                                  }}
                                  onComplete={(taskId, progressData) => {
                                    console.log('Task content completed:', taskId, progressData);
                                  }}
                                  isCompleted={status === 'completed'}
                                  userProgress={{
                                    completedBlocks: [],
                                  }}
                                />
                              );
                            } catch (error) {
                              console.error('Error rendering task content:', error);
                              return (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Task Content Error</h4>
                                  <p className="text-sm text-red-700 dark:text-red-300">
                                    Unable to load task content. Please contact support if this persists.
                                  </p>
                                </div>
                              );
                            }
                          })()}
                        </div>                        {/* Submission Status */}
                        {submission && (
                          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-slate-900 dark:text-white">Your Submission</h4>
                              {getStatusBadge(status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Github className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              <a 
                                href={submission.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {submission.githubUrl}
                              </a>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Submitted on {formatDate(submission.submittedAt)}
                            </p>
                            {submission.feedback && (
                              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded">
                                <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Feedback</h5>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Submission Form */}
                        {isAvailable && !submission && (
                          <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/30">
                            <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">Submit Your Work</h4>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor={`github-${task.id}`} className="text-sm font-medium text-slate-900 dark:text-white">
                                  GitHub Repository URL
                                </Label>
                                <Input
                                  id={`github-${task.id}`}
                                  type="url"
                                  placeholder="https://github.com/username/repository"
                                  value={formData.githubUrl || ''}
                                  onChange={(e) => handleSubmissionChange(task.id, 'githubUrl', e.target.value)}
                                  className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                              <Button 
                                onClick={() => handleSubmitTask(task.id)}
                                disabled={submitting[task.id] || !formData.githubUrl?.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                              >
                                {submitting[task.id] ? (
                                  'Submitting...'
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Task
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Resubmission for requires changes */}
                        {submission && submission.status === 'REQUIRES_CHANGES' && (
                          <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/30">
                            <h4 className="font-medium mb-3 text-red-900 dark:text-red-100">Resubmit Your Work</h4>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor={`github-resubmit-${task.id}`} className="text-sm font-medium text-slate-900 dark:text-white">
                                  Updated GitHub Repository URL
                                </Label>
                                <Input
                                  id={`github-resubmit-${task.id}`}
                                  type="url"
                                  placeholder="https://github.com/username/repository"
                                  value={formData.githubUrl || ''}
                                  onChange={(e) => handleSubmissionChange(task.id, 'githubUrl', e.target.value)}
                                  className="mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                />
                              </div>
                              <Button 
                                onClick={() => handleSubmitTask(task.id)}
                                disabled={submitting[task.id] || !formData.githubUrl?.trim()}
                                className="w-full border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
                                variant="outline"
                              >
                                {submitting[task.id] ? (
                                  'Resubmitting...'
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Resubmit Task
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Locked Task Message */}
                        {!isAvailable && !submission && (
                          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center border border-slate-200 dark:border-slate-600">
                            <Lock className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Complete the previous task to unlock this one
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
            </div>
          </div>
        </div>
      </SignedIn>      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
