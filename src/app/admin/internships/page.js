'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Search,
  Filter,
  Eye,
  Building,
  Target,
  TrendingUp,
  BookOpen,
  Briefcase
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
  
  // Ensure children is safely rendered
  const safeChildren = children == null ? '' : String(children)
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {safeChildren}
    </span>
  )
}

export default function AdminInternshipsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [filteredInternships, setFilteredInternships] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteInternshipId, setDeleteInternshipId] = useState(null)

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

        // Fetch internships
        const internshipsRes = await fetch('/api/admin/internships')
        if (internshipsRes.ok) {
          const data = await internshipsRes.json()
          // API returns { internships: [...] }
          const internshipsArray = Array.isArray(data.internships) ? data.internships : []
          setInternships(internshipsArray)
          setFilteredInternships(internshipsArray)
        } else {
          setInternships([])
          setFilteredInternships([])
        }
      } catch (error) {} finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  // Filter internships based on search and status
  useEffect(() => {
    if (!Array.isArray(internships)) return
    
    let filtered = internships.filter(internship => internship && typeof internship === 'object')

    if (searchTerm) {
      filtered = filtered.filter(internship =>
        (internship.title && internship.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (internship.field && internship.field.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredInternships(filtered)
  }, [internships, searchTerm])

  const handleDeleteInternship = async (internshipId) => {
    setDeleteInternshipId(internshipId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteInternshipId) return

    try {
      const response = await fetch(`/api/admin/internships/${deleteInternshipId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Internship deleted successfully!')
        
        // Refresh internships list
        const internshipsRes = await fetch('/api/internships')
        if (internshipsRes.ok) {
          const data = await internshipsRes.json()
          const internshipsArray = Array.isArray(data.internships) ? data.internships : []
          setInternships(internshipsArray)
          setFilteredInternships(internshipsArray)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete internship')
      }
    } catch (error) {
      toast.error('Error deleting internship')
    } finally {
      setDeleteConfirmOpen(false)
      setDeleteInternshipId(null)
    }
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Internships" 
        subtitle="Preparing the internship management interface..."
        variant="primary"
        icon={Briefcase}
      />
    )
  }

  return (
    <>
      <SignedIn>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-screen bg-white dark:bg-slate-950">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Manage Internships</h1>
                  <p className="text-slate-600 dark:text-slate-300">Create, edit, and manage all internship opportunities.</p>
                </div>
              </div>
              
              <Button onClick={() => router.push('/admin/internships/create')} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New Internship
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{Array.isArray(internships) ? internships.length : 0}</p>
                      <p className="text-slate-600 dark:text-slate-400">Total Internships</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Array.isArray(internships) ? 
                          internships.reduce((total, i) => total + (parseInt(i?.capacity) || 0), 0) : 0}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">Total Capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                {Array.isArray(filteredInternships) ? filteredInternships.length : 0} {(Array.isArray(filteredInternships) ? filteredInternships.length : 0) === 1 ? 'internship' : 'internships'} found
              </p>
            </div>

            {/* Internships List */}
            {Array.isArray(filteredInternships) && filteredInternships.length > 0 ? (
              <div className="space-y-6">
                {filteredInternships.map((internship) => (
                  <Card key={internship?.id || Math.random()} className="hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{internship?.title || 'Unknown Title'}</h3>
                            <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">{internship?.field || 'Unknown Field'}</Badge>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {internship?.location || 'Remote/TBD'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {internship?.duration ? `${internship.duration} weeks` : 'Duration TBD'}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {internship?.capacity || 0} positions
                            </div>
                            {internship?.learningPath && (
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                Learning Path: {internship.learningPath.title} ({internship.learningPath.tasks?.length || 0} tasks)
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => router.push(`/admin/internships/${internship.id}/view`)}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/internships/${internship.id}/application-form`)}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Setup Form
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/internships/${internship.id}/edit`)}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteInternship(internship.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 dark:text-slate-300 mb-4">{internship?.description || 'No description available'}</p>
                      
                      {internship?.requirements && (
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Requirements:</h4>
                          <p className="text-slate-700 dark:text-slate-300">{internship.requirements}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Building className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No internships found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search criteria.'
                      : 'Get started by creating your first internship.'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => router.push('/admin/internships/create')} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Internship
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete Internship
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete this internship? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setDeleteInternshipId(null)
                }}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
