'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, PlayCircle, FileText, Clock, Target, Edit, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from "sonner"
import { ContentLoading } from '@/components/ui/loading-spinner'
// ...removed AdminLayout import...

export default function ManageTasksPage() {
  const router = useRouter()
  const params = useParams()
  const pathId = params.id
  
  const [isLoading, setIsLoading] = useState(true)
  const [learningPath, setLearningPath] = useState(null)

  const fetchLearningPath = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}`)
      if (response.ok) {
        const data = await response.json()
        setLearningPath(data.learningPath)
      } else {
        toast.error('Learning path not found')
        router.push('/admin/learning-paths')
      }
    } catch (error) {
      console.error('Error fetching learning path:', error)
      toast.error('Failed to load learning path')
    } finally {
      setIsLoading(false)
    }
  }, [pathId, router])

  useEffect(() => {
    fetchLearningPath()
  }, [fetchLearningPath])

  const handleBackToLearningPaths = () => {
    router.push('/admin/learning-paths')
  }

  // Helper function for content type icon
  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'VIDEO':
        return <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'BUILDER':
        return <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case 'TEXT':
      default:
        return <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
    }
  }

  if (isLoading) {
    return (
      <ContentLoading title="Loading Tasks" subtitle="Fetching learning path tasks..." icon={Settings} />
    )
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Learning Path Not Found</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">The learning path you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={handleBackToLearningPaths} variant="outline">
            Back to Learning Paths
          </Button>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button in container */}
        <div className="flex items-center gap-2 mb-8">
          <Button
            onClick={handleBackToLearningPaths}
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Paths
          </Button>
          <span className="text-xl font-bold text-slate-900 dark:text-white">Manage Tasks</span>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Tasks</h1>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {learningPath.tasks?.length || 0} tasks
              </Badge>
              <Button
                onClick={() => router.push(`/admin/learning-paths/${pathId}/tasks/create`)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Task
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{learningPath.title}</p>
        </div>
        {/* Main Content */}
        {/* Quick Actions */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Task Management</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Create and manage tasks for this learning path using our advanced task builder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push(`/admin/learning-paths/${pathId}/tasks/create`)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Task
              </Button>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Target className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                Use our drag-and-drop builder to create rich, interactive tasks
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Tasks */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Existing Tasks ({learningPath.tasks?.length || 0})
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage the tasks in this learning path
            </CardDescription>
          </CardHeader>
          <CardContent>
            {learningPath.tasks && learningPath.tasks.length > 0 ? (
              <div className="space-y-3">
                  {learningPath.tasks
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((task, index) => (
                    <Card key={task.id} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            {/* Header with task number and title */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                                {task.order || index + 1}
                              </div>
                              <h5 className="text-lg font-semibold text-slate-900 dark:text-white flex-1">{task.title}</h5>
                              <div className="flex items-center gap-2">
                                {getContentTypeIcon(task.contentType)}
                                <Badge variant={
                                  task.contentType === 'VIDEO' ? 'default' : 
                                  task.contentType === 'BUILDER' ? 'destructive' : 
                                  'secondary'
                                } className="text-xs">
                                  {task.contentType === 'VIDEO' ? 'Video' :
                                   task.contentType === 'BUILDER' ? 'Builder' :
                                   'Text'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{task.description}</p>
                            
                            {/* Content preview or builder indicator */}
                            {task.content && task.contentType !== 'BUILDER' && (
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4">
                                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium mb-1">Content Preview:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {task.content.length > 150 ? task.content.substring(0, 150) + '...' : task.content}
                                </p>
                              </div>
                            )}
                            
                            {task.contentType === 'BUILDER' && (
                              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 mb-4 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                    Interactive Task Builder Content
                                  </p>
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                  Rich multimedia content with drag-and-drop elements
                                </p>
                              </div>
                            )}
                            
                            {/* Task metadata */}
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Deadline: {task.deadlineOffset ? `${task.deadlineOffset} days` : 'No deadline'}</span>
                              </div>
                              {task.createdAt && (
                                <div className="flex items-center gap-1">
                                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/learning-paths/${pathId}/tasks/${task.id}/edit`)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-w-[80px]"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Tasks Found</h3>
                <p className="text-slate-600 dark:text-slate-400">No tasks have been created for this learning path yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Task deleted successfully!')
        await fetchLearningPath()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }
}
