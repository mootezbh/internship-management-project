'use client'

import { useState, useEffect, Suspense } from 'react'
import { SignedIn, useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Eye,
  Check,
  Clock,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Target,
  Building,
  Mail,
  Calendar,
  Phone,
  GraduationCap
} from 'lucide-react'
import { toast } from "sonner"
import { PageLoading, ButtonLoading } from '@/components/ui/loading-spinner'

// Badge component for consistent styling
const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variantClasses = {
    default: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
    secondary: "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300",
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

function AdminApplicationsContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [internships, setInternships] = useState([])
  const [expandedResponses, setExpandedResponses] = useState({})
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [internshipFilter, setInternshipFilter] = useState('all')

  const toggleResponsesExpansion = (applicationId) => {
    setExpandedResponses(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }))
  }

  // Client-side mounting check
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check for internship filter in URL parameters
  useEffect(() => {
    const internshipParam = searchParams.get('internship')
    if (internshipParam) {
      setInternshipFilter(internshipParam)
    }
  }, [searchParams])

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

        // Fetch applications
        const applicationsRes = await fetch('/api/admin/applications')
        if (applicationsRes.ok) {
          const data = await applicationsRes.json()
          setApplications(Array.isArray(data.applications) ? data.applications : [])
          setFilteredApplications(Array.isArray(data.applications) ? data.applications : [])
        } else {
          toast.error('Failed to load applications')
        }

        // Fetch internships for filter
        const internshipsRes = await fetch('/api/admin/internships')
        if (internshipsRes.ok) {
          const data = await internshipsRes.json()
          setInternships(Array.isArray(data.internships) ? data.internships : [])
        }
      } catch (error) {toast.error('Failed to load applications')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  // Filter applications
  useEffect(() => {
    if (!Array.isArray(applications)) return
    
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.internship?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.internship?.field?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (internshipFilter !== 'all') {
      filtered = filtered.filter(app => app.internship?.id === internshipFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter, internshipFilter])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'ACCEPTED':
        return 'success'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusCounts = () => {
    if (!Array.isArray(applications)) return { total: 0, pending: 0, accepted: 0, rejected: 0 }
    
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length
    }
  }

  const statusCounts = getStatusCounts()

  if (!isMounted) {
    return <div>Loading...</div>
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Applications" 
        subtitle="Fetching internship applications and preparing the dashboard..."
        variant="primary"
        icon={FileText}
      />
    )
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                size="sm"
                className="mr-4 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applications Management</h1>
                <p className="text-gray-600 dark:text-slate-300">Review and manage internship applications</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.total}</p>
                    <p className="text-gray-600 dark:text-slate-400">Total Applications</p>
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.pending}</p>
                    <p className="text-gray-600 dark:text-slate-400">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.accepted}</p>
                    <p className="text-gray-600 dark:text-slate-400">Accepted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.rejected}</p>
                    <p className="text-gray-600 dark:text-slate-400">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <Input
                placeholder="Search by applicant name, email, internship title, or field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="status-filter" className="text-gray-900 dark:text-white">Status:</Label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="internship-filter" className="text-gray-900 dark:text-white">Internship:</Label>
                <select
                  id="internship-filter"
                  value={internshipFilter}
                  onChange={(e) => setInternshipFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Internships</option>
                  {internships.map((internship) => (
                    <option key={internship.id} value={internship.id}>
                      {internship.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filter Status Indicator */}
          {searchParams.get('internship') && internshipFilter !== 'all' && (
            <div className="mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-blue-800 dark:text-blue-300 font-medium">
                      Showing applications for: {internships.find(i => i.id === internshipFilter)?.title || 'Selected Internship'}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setInternshipFilter('all')
                      router.push('/admin/applications')
                    }}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-slate-400">
              {Array.isArray(filteredApplications) ? filteredApplications.length : 0} {(Array.isArray(filteredApplications) ? filteredApplications.length : 0) === 1 ? 'application' : 'applications'} found
            </p>
          </div>

          {/* Applications List */}
          {Array.isArray(filteredApplications) && filteredApplications.length > 0 ? (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <Card key={application?.id || Math.random()} className="hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mr-3">
                            {application?.user?.name || 'Unknown Applicant'}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(application?.status)}>
                            <div className="flex items-center">
                              {getStatusIcon(application?.status)}
                              <span className="ml-1">{application?.status || 'Unknown'}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-slate-300 mb-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {application?.user?.email || 'No email'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Applied: {application?.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown date'}
                          </div>
                          {application?.user?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {application.user.phone}
                            </div>
                          )}
                          {application?.user?.university && (
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              {application.user.university}
                            </div>
                          )}
                        </div>

                        {/* Internship Details */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Applied for:</h4>
                          <div className="text-sm text-gray-600 dark:text-slate-300">
                            <div className="flex items-center mb-1">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="font-medium">{application?.internship?.title || 'Unknown Position'}</span>
                            </div>
                            {application?.internship?.field && (
                              <div className="flex items-center mb-1">
                                <Target className="h-4 w-4 mr-2" />
                                Field: {application.internship.field}
                              </div>
                            )}
                            {application?.internship?.location && (
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-2" />
                                Location: {application.internship.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Application Form Responses - Enhanced with Collapsible */}
                        {application?.responses && application.responses.length > 0 && (
                          <div className="mt-4">
                            <button 
                              onClick={() => toggleResponsesExpansion(application.id)}
                              className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-blue-800 dark:text-blue-300">
                                  Application Form Responses ({application.responses.length})
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2 text-xs">
                                  Click to {expandedResponses[application.id] ? 'hide' : 'view'}
                                </Badge>
                                <div className={`transform transition-transform ${expandedResponses[application.id] ? 'rotate-180' : ''}`}>
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </button>
                            
                            {expandedResponses[application.id] && (
                              <div className="mt-3 space-y-3 bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                                {application.responses.map((response, index) => (
                                  <div key={response.id} className="border-l-4 border-blue-400 dark:border-blue-500 pl-4 bg-gray-50 dark:bg-slate-700/50 rounded-r-md p-3">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-2">
                                      {index + 1}. {response.field?.label || 'Unknown Field'}
                                      {response.field?.required && <span className="text-red-500 ml-1">*</span>}
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {response.field?.type?.toLowerCase()}
                                      </Badge>
                                    </p>
                                    
                                    {response.field?.description && (
                                      <p className="text-xs text-gray-600 dark:text-slate-400 mb-2 italic">
                                        {response.field.description}
                                      </p>
                                    )}
                                    
                                    <div className="bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-600">
                                      {response.field?.type === 'FILE' ? (
                                        <div className="flex items-center">
                                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                          <a 
                                            href={response.value} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                          >
                                            View uploaded file →
                                          </a>
                                        </div>
                                      ) : response.field?.type === 'CHECKBOX' ? (
                                        <div className="flex flex-wrap gap-1">
                                          {JSON.parse(response.value || '[]').map((item, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                              {item}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : response.field?.type === 'RADIO' || response.field?.type === 'SELECT' ? (
                                        <Badge variant="default" className="text-xs">{response.value}</Badge>
                                      ) : (
                                        <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                          {response.value || <span className="text-gray-500 italic">No response provided</span>}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {application?.feedback && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Admin Feedback:</p>
                            <p className="text-sm text-blue-800 dark:text-blue-300">{application.feedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {application?.user?.cvUrl && (
                          <Button
                            onClick={() => window.open(application.user.cvUrl, '_blank')}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            CV
                          </Button>
                        )}
                        <Button
                          onClick={() => router.push(`/admin/users/${application.user.id}/profile?from=/admin/applications`)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Profile
                        </Button>
                        <Button
                          onClick={() => router.push(`/admin/applications/${application.id}/review`)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
                <p className="text-gray-600 dark:text-slate-400">
                  {Array.isArray(applications) && applications.length === 0 
                    ? "No applications have been submitted yet." 
                    : "Try adjusting your search or filter criteria."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SignedIn>
  )
}

// Loading component for Suspense fallback
function ApplicationsLoading() {
  return (
    <PageLoading 
      title="Loading Applications" 
      subtitle="Please wait while we prepare the applications dashboard..."
      variant="primary"
      icon={FileText}
    />
  )
}

// Main export wrapped in Suspense
export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<ApplicationsLoading />}>
      <AdminApplicationsContent />
    </Suspense>
  )
}
