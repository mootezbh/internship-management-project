'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, Save, Settings, FormInput, CheckSquare, FileText } from 'lucide-react'
import FormBuilder from '@/components/form-builder/FormBuilder';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from "sonner"
import { LoadingSpinner } from '@/components/ui/loading-spinner'
// ...removed AdminLayout import...

export default function SetupApplicationFormPage() {
  const router = useRouter()
  const params = useParams()
  const internshipId = params.id
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [internship, setInternship] = useState(null)
  const [formFields, setFormFields] = useState([
    { id: 'name', label: 'Full Name', type: 'TEXT', required: true, builtin: true },
    { id: 'email', label: 'Email Address', type: 'EMAIL', required: true, builtin: true },
    { id: 'phone', label: 'Phone Number', type: 'TEXT', required: false, builtin: true },
    { id: 'education', label: 'Education Background', type: 'TEXTAREA', required: false, builtin: true },
    { id: 'skills', label: 'Skills & Experience', type: 'TEXTAREA', required: false, builtin: true }
  ])

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const response = await fetch(`/api/admin/internships/${internshipId}`)
        if (response.ok) {
          const data = await response.json()
          setInternship(data.internship)
          
          // Load custom form fields if they exist
          if (data.internship.applicationFormFields) {
            try {
              const customFields = JSON.parse(data.internship.applicationFormFields)
              setFormFields(prev => [
                ...prev.filter(field => field.builtin),
                ...customFields.filter(field => !field.builtin)
              ])
            } catch (error) {
              console.error('Error parsing form fields:', error)
            }
          }
        } else {
          toast.error('Failed to load internship')
          router.push('/admin/internships')
        }
      } catch (error) {
        console.error('Error fetching internship:', error)
        toast.error('Failed to load internship')
      } finally {
        setIsLoading(false)
      }
    }

    if (internshipId) {
      fetchInternship()
    }
  }, [internshipId, router])

  const addCustomField = () => {
    const newField = {
      id: `custom_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      builtin: false
    }
    setFormFields([...formFields, newField])
  }

  const updateField = (fieldId, updates) => {
    setFormFields(fields => 
      fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    )
  }

  const removeField = (fieldId) => {
    setFormFields(fields => fields.filter(field => field.id !== fieldId))
  }

  const saveFormConfiguration = async () => {
    setIsSaving(true)
    try {
      // Separate builtin and custom fields
      const customFields = formFields.filter(field => !field.builtin)
      
      const response = await fetch(`/api/admin/internships/${internshipId}/application-form`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationFormFields: JSON.stringify(customFields),
          allFields: formFields
        })
      })

      if (response.ok) {
        toast.success('Application form updated successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update application form')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      toast.error('Failed to save form configuration')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingSpinner text="Loading Application Form" icon={Settings} />
    )
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Internship Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">The internship you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/internships')} variant="outline">
            Back to Internships
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title in container */}
        <div className="flex items-center gap-2 mb-8">
          <Button
            onClick={() => router.push('/admin/internships')}
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Internships
          </Button>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">Setup Application Form</span>
          <Button 
            onClick={saveFormConfiguration}
            disabled={isSaving}
            className="ml-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Form
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">Configure application form for: {internship.title}</p>
        {/* Drag-and-drop Form Builder */}
        <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Application Form Fields</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Customize the application form that candidates will fill out when applying for this internship.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* FormBuilder drag-and-drop component */}
            <div className="mb-6">
              <FormBuilder
                initialFields={formFields}
                onSave={fields => setFormFields(fields)}
              />
            </div>
          </CardContent>
        </Card>
        {/* Preview */}
        <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Form Preview</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              This is how the application form will appear to candidates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Apply for: {internship.title}
              </h3>
              {formFields.map((field) => (
                <div key={field.id}>
                  <Label className="text-slate-900 dark:text-white">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'TEXTAREA' ? (
                    <Textarea
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      disabled
                      className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <Input
                      type={field.type === 'EMAIL' ? 'email' : 'text'}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      disabled
                      className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
