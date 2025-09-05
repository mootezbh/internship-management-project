'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
// ...removed AdminLayout import...

export default function CreateLearningPathPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        toast.success('Learning path created successfully!')
        router.push('/admin/learning-paths')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create learning path')
      }
    } catch (error) {
      console.error('Error creating learning path:', error)
      toast.error('Failed to create learning path')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title in container */}
        <div className="flex items-center gap-2 mb-8">
          <Button
            onClick={() => router.push('/admin/learning-paths')}
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Paths
          </Button>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">Create Learning Path</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">Add a new learning path for internships</p>
        {/* Main Content */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Learning Path Details</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Create a structured learning path to guide interns through their journey
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
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/learning-paths')}
                  disabled={isSubmitting}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Learning Path'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
