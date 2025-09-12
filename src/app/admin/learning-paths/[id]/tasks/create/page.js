'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from "sonner"
import { ContentLoading } from '@/components/ui/loading-spinner'
import TaskBuilder from '@/components/task-builder/TaskBuilder'

export default function CreateTaskPage() {
  const router = useRouter()
  const params = useParams()
  const pathId = params.id
  
  const [isLoading, setIsLoading] = useState(true)
  const [learningPath, setLearningPath] = useState(null)

  useEffect(() => {
    const fetchLearningPath = async () => {
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
    }

    if (pathId) {
      fetchLearningPath()
    }
  }, [pathId, router])

  const handleSaveTask = async (taskData) => {
    try {
      console.log('Sending task data:', taskData); // Debug log
      
      // Validate required fields on client side
      if (!taskData.title || !taskData.description) {
        toast.error('Please fill in both title and description');
        return;
      }

      // Determine content type based on task content
      let contentType = 'TEXT'; // Default
      let contentToSave = taskData.content || '';
      
      if (taskData.content && Array.isArray(taskData.content)) {
        // JSON content from TaskBuilder - determine type from first content block
        const firstBlock = taskData.content[0];
        if (firstBlock && firstBlock.type) {
          contentType = firstBlock.type;
        }
        contentToSave = JSON.stringify(taskData.content);
      } else if (typeof taskData.content === 'string') {
        // Simple string content - could be text, URL, etc.
        contentToSave = taskData.content;
        // Could add URL detection logic here if needed
      }

      const payload = {
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        content: contentToSave,
        contentType: contentType,
        order: parseInt(taskData.order) || 1,
        deadlineOffset: parseInt(taskData.deadlineOffset) || 1
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch(`/api/admin/learning-paths/${pathId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json();
      console.log('Response:', response.status, responseData); // Debug log

      if (response.ok) {
        toast.success('Task created successfully!')
        router.push(`/admin/learning-paths/${pathId}/tasks`)
      } else {
        console.error('Server error:', responseData);
        toast.error(responseData.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <ContentLoading title="Loading Task Builder" subtitle="Preparing your task creation environment..." icon={Settings} />
      </div>
    )
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Learning Path Not Found</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">The learning path you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/learning-paths')} variant="outline">
            Back to Learning Paths
          </Button>
        </div>
      </div>
    )
  }

  const nextOrder = learningPath.tasks?.length > 0 
    ? Math.max(...learningPath.tasks.map(t => t.order || 0)) + 1
    : 1

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title in container */}
        <div className="flex items-center gap-2 mb-8">
          <Button
            onClick={() => router.push(`/admin/learning-paths/${pathId}/tasks`)}
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">Create Task</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">Add a new task to <span className="font-semibold text-blue-600 dark:text-blue-400">{learningPath.title}</span></p>
        {/* Main Content */}
        <div className="rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-6">
          <TaskBuilder
            initialContent={[]}
            onSave={handleSaveTask}
            taskData={{
              title: '',
              description: '',
              order: nextOrder,
              required: false
            }}
            learningPathTitle={learningPath.title}
            onBack={() => router.push(`/admin/learning-paths/${pathId}/tasks`)}
          />
        </div>
      </div>
    </div>
  )
}
