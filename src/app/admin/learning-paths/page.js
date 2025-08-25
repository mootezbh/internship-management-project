'use client'

import { useState, useEffect } from 'react'
import { SignedIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  PlayCircle,
  FileText,
  Target,
  GraduationCap,
  Search,
  Settings
} from 'lucide-react'
import { toast } from "sonner"
import { PageLoading } from '@/components/ui/loading-spinner'
// ...removed AdminLayout import...

// Badge component
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

export default function AdminLearningPathsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [learningPaths, setLearningPaths] = useState([])
  const [filteredPaths, setFilteredPaths] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Check if user is admin
        const adminCheckRes = await fetch('/api/admin/check')
        const adminCheck = await adminCheckRes.json()

        if (!adminCheck.isAdmin) {
          router.push('/')
          return
        }

        // Fetch learning paths
        const pathsRes = await fetch('/api/admin/learning-paths')
        if (pathsRes.ok) {
          const pathsData = await pathsRes.json()
          setLearningPaths(Array.isArray(pathsData.learningPaths) ? pathsData.learningPaths : [])
          setFilteredPaths(Array.isArray(pathsData.learningPaths) ? pathsData.learningPaths : [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load learning paths')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPaths(learningPaths)
    } else {
      const filtered = learningPaths.filter(path =>
        path.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPaths(filtered)
    }
  }, [searchTerm, learningPaths])

  const refreshData = async () => {
    try {
      const pathsRes = await fetch('/api/admin/learning-paths')
      if (pathsRes.ok) {
        const pathsData = await pathsRes.json()
        const pathsArray = Array.isArray(pathsData.learningPaths) ? pathsData.learningPaths : []
        setLearningPaths(pathsArray)
        setFilteredPaths(pathsArray)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const handleDeletePath = async (pathId) => {
    if (!confirm('Are you sure you want to delete this learning path? This will also delete all its tasks and cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Learning path deleted successfully!')
        await refreshData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete learning path')
      }
    } catch (error) {
      console.error('Error deleting learning path:', error)
      toast.error('Failed to delete learning path')
    }
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Learning Paths" 
        subtitle="Preparing the learning path management interface..."
        variant="primary"
        icon={BookOpen}
      />
    )
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back to Dashboard Button */}
          <div className="flex items-center gap-2 mb-8">
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Learning Paths Management</span>
            <Button 
              onClick={() => router.push('/admin/learning-paths/create')}
              className="ml-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Learning Path
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">Create and manage learning paths with tasks for internships</p>
          {/* Main Content */}
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {Array.isArray(learningPaths) ? learningPaths.length : 0}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">Total Learning Paths</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {Array.isArray(learningPaths) ? 
                        learningPaths.reduce((total, path) => total + (path?.tasks?.length || 0), 0) : 0}
                    </p>
                    <p className="text-green-700 dark:text-green-300">Total Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {Array.isArray(learningPaths) ? 
                        learningPaths.filter(path => path?.tasks?.length > 0).length : 0}
                    </p>
                    <p className="text-purple-700 dark:text-purple-300">Active Paths</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Search Learning Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Paths List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPaths.length > 0 ? (
              filteredPaths.map((path) => (
                <Card key={path.id} className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-gray-900 dark:text-white">{path.title}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-slate-300">
                          {path.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/learning-paths/${path.id}/tasks`)}
                          className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Tasks
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/learning-paths/${path.id}/edit`)}
                          className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePath(path.id)}
                          className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Tasks:</span>
                        <Badge variant="secondary">{path?.tasks?.length || 0} tasks</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Created:</span>
                        <span className="text-gray-900 dark:text-white">
                          {path.createdAt ? new Date(path.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>

                      {path?.tasks && path.tasks.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Recent Tasks:</p>
                          <div className="space-y-1">
                            {path.tasks.slice(0, 3).map((task, index) => (
                              <div key={task.id || index} className="flex items-center text-xs text-gray-600 dark:text-slate-400">
                                {task.contentType === 'VIDEO' ? (
                                  <PlayCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <FileText className="h-3 w-3 mr-1" />
                                )}
                                <span className="truncate">{task.title || 'Untitled Task'}</span>
                              </div>
                            ))}
                            {path.tasks.length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-slate-500">
                                +{path.tasks.length - 3} more tasks
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    {searchTerm ? (
                      <>
                        <Search className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching learning paths</h3>
                        <p className="text-gray-600 dark:text-slate-400 mb-4">
                          No learning paths match your search criteria.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm('')}
                          className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No learning paths yet</h3>
                        <p className="text-gray-600 dark:text-slate-400 mb-4">
                          Get started by creating your first learning path.
                        </p>
                        <Button 
                          onClick={() => router.push('/admin/learning-paths/create')} 
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Learning Path
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
      {/* ...existing code... */}
        </div>
      </div>
    </SignedIn>
  )
}
