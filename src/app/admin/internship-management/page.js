'use client'

import { useState, useEffect } from 'react'
import { SignedIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Target,
  Edit3,
  Eye,
  Calendar as CalendarIcon,
  Activity,
  Award,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  MessageSquare,
  BarChart3,
  MapPin,
  Timer,
  UserCheck,
  AlertTriangle
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
    destructive: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300"
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
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto border border-slate-200 dark:border-slate-700 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ children }) => <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">{children}</div>
const DialogTitle = ({ children }) => <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{children}</h2>
const DialogContent = ({ children }) => <div className="px-6 py-4">{children}</div>

// Intern Progress Card Component
const InternProgressCard = ({ intern, onViewDetails, onAdjustDeadline, onReviewSubmission }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in-progress': return 'text-blue-600'
      case 'overdue': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-slate-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in-progress': return <Activity className="h-4 w-4 text-blue-600" />
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-slate-600" />
    }
  }

  const completedTasks = intern.tasks?.filter(task => task.status === 'completed').length || 0
  const totalTasks = intern.tasks?.length || 0
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const currentTask = intern.tasks?.find(task => task.status === 'in-progress') || 
                     intern.tasks?.find(task => task.status === 'pending') ||
                     intern.tasks?.find(task => task.status === 'overdue')

  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">{intern.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{intern.email}</p>
            </div>
          </div>
          <Badge variant={intern.overallStatus === 'on-track' ? 'success' : intern.overallStatus === 'at-risk' ? 'warning' : 'destructive'}>
            {intern.overallStatus}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Progress Overview */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
              <span className="font-medium text-slate-900 dark:text-white">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {progressPercentage.toFixed(0)}% complete
            </div>
          </div>

          {/* Current Task */}
          {currentTask && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(currentTask.status)}
                  <span className="font-medium text-sm text-slate-900 dark:text-white">Current Task</span>
                </div>
                <Badge variant={currentTask.status === 'overdue' ? 'destructive' : 'secondary'}>
                  {currentTask.status}
                </Badge>
              </div>
              <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{currentTask.title}</h4>
              <div className="flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Due: {currentTask.deadline}</span>
                </div>
                {currentTask.submission && (
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3 w-3" />
                    <span>Submitted</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {intern.tasks?.filter(t => t.status === 'pending').length || 0}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {intern.tasks?.filter(t => t.status === 'overdue').length || 0}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">Overdue</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(intern)}
              className="flex-1 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjustDeadline(intern)}
              className="flex-1 text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Adjust Deadlines
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function InternshipManagementPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [interns, setInterns] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIntern, setSelectedIntern] = useState(null)
  const [showInternDetails, setShowInternDetails] = useState(false)
  const [showDeadlineDialog, setShowDeadlineDialog] = useState(false)
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [deadlineForm, setDeadlineForm] = useState({
    taskId: '',
    newDeadlineOffset: '',
    reason: ''
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

        // Fetch internships
        const internshipsRes = await fetch('/api/admin/internships')
        if (internshipsRes.ok) {
          const data = await internshipsRes.json()
          setInternships(Array.isArray(data.internships) ? data.internships : [])
        } else {
          toast.error('Failed to load internships')
        }
      } catch (error) {
        toast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const handleInternshipSelect = async (internship) => {
    setSelectedInternship(internship)
    setIsLoading(true)
    
    try {
      // Fetch interns and their progress for this internship
      const response = await fetch(`/api/admin/internships/${internship.id}/progress`)
      if (response.ok) {
        const data = await response.json()
        setInterns(data.interns || [])
      } else {
        toast.error('Failed to load intern progress')
      }
    } catch (error) {
      toast.error('Failed to load intern progress')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (intern) => {
    setSelectedIntern(intern)
    setShowInternDetails(true)
  }

  const handleAdjustDeadline = (intern) => {
    setSelectedIntern(intern)
    setShowDeadlineDialog(true)
  }

  const handleReviewSubmission = (submission) => {
    setSelectedIntern(submission)
    setShowSubmissionDialog(true)
  }

  // Filter interns based on search and status
  const filteredInterns = interns.filter(intern => {
    const matchesSearch = !searchTerm || 
      intern.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || intern.overallStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (isLoading && !selectedInternship) {
    return <PageLoading />
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Internship Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Monitor progress, manage deadlines, and review submissions
                </p>
              </div>
            </div>
          </div>

          {!selectedInternship ? (
            /* Internship Selection */
            <div className="grid gap-6">
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Select an Internship to Manage</span>
                  </CardTitle>
                  <CardDescription>
                    Choose an internship to view intern progress and manage learning paths
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {internships.map((internship) => (
                      <Card 
                        key={internship.id}
                        className="cursor-pointer border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                        onClick={() => handleInternshipSelect(internship)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">
                              {internship.title}
                            </h3>
                            <Badge variant="secondary">
                              {internship.applications?.filter(app => app.status === 'ACCEPTED').length || 0} interns
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                            {internship.description}
                          </p>
                          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{internship.location || 'Remote'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Timer className="h-3 w-3" />
                              <span>{internship.duration} weeks</span>
                            </div>
                            {internship.startDate && (
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>Starts {new Date(internship.startDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Intern Management Dashboard */
            <div className="space-y-6">
              {/* Selected Internship Header */}
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedInternship(null)}
                        className="text-slate-600 dark:text-slate-400"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Internships
                      </Button>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {selectedInternship.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                          Managing {filteredInterns.length} interns
                        </p>
                      </div>
                    </div>
                    <Badge variant="purple">
                      {selectedInternship.learningPath?.title || 'No Learning Path'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {interns.filter(i => i.overallStatus === 'on-track').length}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">On Track</p>
                      </div>
                      <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {interns.filter(i => i.overallStatus === 'at-risk').length}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">At Risk</p>
                      </div>
                      <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                          {interns.filter(i => i.overallStatus === 'behind').length}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">Behind</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(interns.reduce((acc, i) => acc + (i.progressPercentage || 0), 0) / (interns.length || 1))}%
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Avg Progress</p>
                      </div>
                      <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="search">Search Interns</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="search"
                          placeholder="Search by name or email..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status-filter">Status Filter</Label>
                      <select
                        id="status-filter"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="on-track">On Track</option>
                        <option value="at-risk">At Risk</option>
                        <option value="behind">Behind</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => handleInternshipSelect(selectedInternship)}
                        className="w-full"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Intern Cards Grid */}
              {filteredInterns.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredInterns.map((intern) => (
                    <InternProgressCard
                      key={intern.id}
                      intern={intern}
                      onViewDetails={handleViewDetails}
                      onAdjustDeadline={handleAdjustDeadline}
                      onReviewSubmission={handleReviewSubmission}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Users className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No Interns Found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {interns.length === 0 
                        ? "No accepted interns for this internship yet."
                        : "No interns match your current filters."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Intern Details Modal */}
        <Dialog open={showInternDetails} onOpenChange={setShowInternDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Intern Progress Details</DialogTitle>
            </DialogHeader>
            {selectedIntern && (
              <div className="space-y-6">
                {/* Intern Info */}
                <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{selectedIntern.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedIntern.email}</p>
                    <Badge variant={selectedIntern.overallStatus === 'on-track' ? 'success' : selectedIntern.overallStatus === 'at-risk' ? 'warning' : 'destructive'}>
                      {selectedIntern.overallStatus}
                    </Badge>
                  </div>
                </div>

                {/* Progress Overview */}
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">Progress Overview</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedIntern.completedTasks}</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedIntern.progressPercentage}%</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Overall Progress</div>
                    </div>
                  </div>
                </div>

                {/* Task List */}
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">Task Progress</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedIntern.tasks?.map((task, index) => (
                      <div key={task.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">#{index + 1}</div>
                            <div>
                              <h5 className="font-medium text-slate-900 dark:text-white">{task.title}</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{task.description}</p>
                            </div>
                          </div>
                          <Badge variant={
                            task.status === 'completed' ? 'success' :
                            task.status === 'overdue' ? 'destructive' :
                            task.status === 'in-progress' ? 'default' : 'secondary'
                          }>
                            {task.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>Due: {task.deadline}</span>
                            </div>
                            {task.submission && (
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>Submitted</span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task)
                                setDeadlineForm({
                                  taskId: task.id,
                                  newDeadlineOffset: task.deadlineOffset?.toString() || '',
                                  reason: ''
                                })
                                setShowDeadlineDialog(true)
                              }}
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Adjust Deadline
                            </Button>
                            {task.submission && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setShowSubmissionDialog(true)
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Deadline Adjustment Modal */}
        <Dialog open={showDeadlineDialog} onOpenChange={setShowDeadlineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Task Deadline</DialogTitle>
            </DialogHeader>
            {selectedTask && selectedIntern && (
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  const response = await fetch(`/api/admin/deadlines/${selectedIntern.id}/${selectedTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      deadlineOffset: parseInt(deadlineForm.newDeadlineOffset),
                      reason: deadlineForm.reason
                    })
                  })

                  if (response.ok) {
                    toast.success('Deadline adjusted successfully!')
                    setShowDeadlineDialog(false)
                    // Refresh data
                    handleInternshipSelect(selectedInternship)
                  } else {
                    const error = await response.json()
                    toast.error(error.error || 'Failed to adjust deadline')
                  }
                } catch (error) {
                  toast.error('Failed to adjust deadline')
                }
              }} className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Task Details</h4>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="font-medium text-slate-900 dark:text-white">{selectedTask.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Current deadline: {selectedTask.deadline}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Current offset: {selectedTask.deadlineOffset} days from start</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="deadline-offset">New Deadline (days from internship start)</Label>
                  <Input
                    id="deadline-offset"
                    type="number"
                    min="1"
                    value={deadlineForm.newDeadlineOffset}
                    onChange={(e) => setDeadlineForm({...deadlineForm, newDeadlineOffset: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason for adjustment (optional)</Label>
                  <textarea
                    id="reason"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    rows={3}
                    value={deadlineForm.reason}
                    onChange={(e) => setDeadlineForm({...deadlineForm, reason: e.target.value})}
                    placeholder="Explain why the deadline is being adjusted..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Adjust Deadline
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDeadlineDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Submission Review Modal */}
        <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
            </DialogHeader>
            {selectedTask && selectedIntern && (
              <div className="space-y-6">
                {/* Task and Intern Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Task:</span>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedTask.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Intern:</span>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedIntern.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Status:</span>
                    <Badge variant={
                      selectedTask.submission?.status === 'APPROVED' ? 'success' :
                      selectedTask.submission?.status === 'REQUIRES_CHANGES' ? 'destructive' : 'warning'
                    }>
                      {selectedTask.submission?.status || 'PENDING'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Submitted:</span>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedTask.submission?.submittedAt ? 
                        new Date(selectedTask.submission.submittedAt).toLocaleDateString() : 'Not submitted'}
                    </p>
                  </div>
                </div>

                {/* Submission Content */}
                {selectedTask.submission && (
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">Submission Content</h4>
                    
                    {/* GitHub URL */}
                    {selectedTask.submission.githubUrl && (
                      <div className="mb-4">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">GitHub Repository:</span>
                        <div className="mt-1">
                          <Button
                            variant="outline"
                            onClick={() => window.open(selectedTask.submission.githubUrl, '_blank')}
                            className="flex items-center space-x-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Open Repository</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Additional submission data */}
                    {selectedTask.submission.feedback && (() => {
                      try {
                        const submissionData = JSON.parse(selectedTask.submission.feedback);
                        return (
                          <div className="space-y-3">
                            {submissionData.text && (
                              <div>
                                <span className="text-slate-600 dark:text-slate-400 text-sm">Text Response:</span>
                                <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border">
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
                                    className="flex items-center space-x-2"
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
                                    className="flex items-center space-x-2"
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
                        return null;
                      }
                    })()}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/admin/task-submissions/${selectedTask.submission.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'APPROVED', feedback: '' })
                        })
                        if (response.ok) {
                          toast.success('Submission approved!')
                          setShowSubmissionDialog(false)
                          handleInternshipSelect(selectedInternship)
                        }
                      } catch (error) {
                        toast.error('Failed to approve submission')
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/admin/task-submissions/${selectedTask.submission.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'REQUIRES_CHANGES', feedback: 'Please review and resubmit.' })
                        })
                        if (response.ok) {
                          toast.success('Submission marked as requiring changes!')
                          setShowSubmissionDialog(false)
                          handleInternshipSelect(selectedInternship)
                        }
                      } catch (error) {
                        toast.error('Failed to update submission')
                      }
                    }}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SignedIn>
  )
}
