'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from "sonner"
import { ContentLoading } from '@/components/ui/loading-spinner'
import TaskBuilder from '@/components/task-builder/TaskBuilder'
import { AdminLayout } from '@/components/layout/admin-layout'

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const pathId = params.id
  const taskId = params.taskId
  
  const [isLoading, setIsLoading] = useState(true)
  const [learningPath, setLearningPath] = useState(null)
  const [task, setTask] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch learning path
        const pathResponse = await fetch(`/api/admin/learning-paths/${pathId}`)
        if (pathResponse.ok) {
          const pathData = await pathResponse.json()
          setLearningPath(pathData.learningPath)
          
          // Find the task
          const foundTask = pathData.learningPath.tasks?.find(t => t.id === taskId)
          if (foundTask) {
            setTask(foundTask)
          } else {
            toast.error('Task not found')
            router.push(`/admin/learning-paths/${pathId}/tasks`)
          }
        } else {
          toast.error('Learning path not found')
          router.push('/admin/learning-paths')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    if (pathId && taskId) {
      fetchData()
    }
  }, [pathId, taskId, router])

  const handleSaveTask = async (taskData) => {
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          content: JSON.stringify(taskData.content),
          contentType: 'BUILDER',
          order: taskData.order,
          deadlineOffset: taskData.deadlineOffset
        })
      })

      if (response.ok) {
        toast.success('Task updated successfully!')
        router.push(`/admin/learning-paths/${pathId}/tasks`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  if (isLoading) {
    return (
      <ContentLoading title="Loading Task Editor" subtitle="Loading task data..." icon={Settings} />
    )
  }

  if (!learningPath || !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Task Not Found</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">The task you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push(`/admin/learning-paths/${pathId}/tasks`)} variant="outline">
            Back to Tasks
          </Button>
        </div>
      </div>
    )
  }

  // Parse existing content if it's a builder task
  let initialContent = []
  if (task.contentType === 'BUILDER' && task.content) {
    try {
      initialContent = JSON.parse(task.content)
    } catch (error) {
      console.error('Error parsing task content:', error)
      // If parsing fails, create a single content block from the existing content
      initialContent = [{
        id: `content_${Date.now()}`,
        type: 'TEXT',
        title: 'Existing Content',
        content: task.content,
        order: 0,
        required: false
      }]
    }
  } else if (task.content) {
    // Convert old-style content to builder format
    initialContent = [{
      id: `content_${Date.now()}`,
      type: task.contentType === 'VIDEO' ? 'VIDEO' : 'TEXT',
      title: 'Existing Content',
      content: task.contentType === 'VIDEO' ? '' : task.content,
      url: task.contentType === 'VIDEO' ? task.content : '',
      order: 0,
      required: false
    }]
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button and Title in container */}
        <div className="flex items-center gap-2 mb-10">
          <Button
            onClick={() => router.push(`/admin/learning-paths/${pathId}/tasks`)}
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Edit Task</span>
        </div>
        <div className="mb-8">
          <p className="text-md text-slate-600 dark:text-slate-400">Edit <span className="font-semibold text-blue-600 dark:text-blue-400">{task.title}</span> in <span className="font-semibold text-blue-600 dark:text-blue-400">{learningPath.title}</span></p>
        </div>
        <div className="rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-md p-8">
          <TaskBuilder
            initialContent={initialContent}
            onSave={handleSaveTask}
            taskData={{
              title: task.title,
              description: task.description,
              order: task.order,
              required: task.required || false
            }}
            learningPathTitle={learningPath.title}
            onBack={() => router.push(`/admin/learning-paths/${pathId}/tasks`)}
            isEditMode={true}
            editTaskTitle={task.title}
          />
        </div>
      </div>
    </div>
  )
}
