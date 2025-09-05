'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
import { LoadingSpinner } from '@/components/ui/loading-spinner'
// ...removed AdminLayout import...

export default function EditLearningPathPage() {
  const router = useRouter()
  const params = useParams()
  const pathId = params.id
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [learningPath, setLearningPath] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const fetchLearningPath = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}`)
      if (response.ok) {
        const data = await response.json()
        setLearningPath(data)
        setFormData({
          title: data.title || '',
          description: data.description || ''
        })
      } else {
        toast.error('Learning path not found')
        router.push('/admin/learning-paths')
      }
    } catch (error) {
      console.error('Error fetching learning path:', error)
      toast.error('Failed to load learning path')
      router.push('/admin/learning-paths')
    } finally {
      setIsLoading(false)
    }
  }, [pathId, router])

  useEffect(() => {
    fetchLearningPath()
  }, [fetchLearningPath])

  if (isLoading) {
    return (
      <LoadingSpinner text="Loading Learning Path" icon={BookOpen} />
    )
  }
  if (!learningPath) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Learning Path Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">The learning path you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/learning-paths')} variant="outline">
            Back to Learning Paths
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Learning path updated successfully!')
        router.push('/admin/learning-paths')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update learning path')
      }
    } catch (error) {
      console.error('Error updating learning path:', error)
      toast.error('Failed to update learning path')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this learning path? This will also delete all its tasks and cannot be undone.')) {
      return
    }
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Learning path deleted successfully!')
        router.push('/admin/learning-paths')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete learning path')
      }
    } catch (error) {
      console.error('Error deleting learning path:', error)
      toast.error('Failed to delete learning path')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <LoadingSpinner text="Loading Learning Path" icon={BookOpen} />
    )
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Learning Path Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">The learning path you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/learning-paths')} variant="outline">
            Back to Learning Paths
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Learning Path</h1>
            <div className="flex space-x-3">
              <Button 
                onClick={handleDelete}
                disabled={isDeleting}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" text="" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Path
                  </>
                )}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" text="" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Update details for: {learningPath.title || 'Learning Path'}</p>
        </div>
        {/* Main Content */}
        {/* Learning Path Details */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Learning Path Details</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Update the learning path information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-slate-900 dark:text-white">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter learning path title"
                  required
                  className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-900 dark:text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter learning path description (optional)"
                  rows={4}
                  className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      {/* ...existing code... */}
      </div>
    </div>
  )
}
