'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import CVReview from '@/components/onboarding/CVReview'
import { SKILLS_CATEGORIES as skillCategories, CAREER_OPPORTUNITIES as careerOpportunities } from '@/lib/data/categories'
import { 
  personalInfoSchema, 
  educationSchema, 
  experienceSchema, 
  preferencesSchema,
  completeOnboardingSchema 
} from '@/lib/validations/onboarding'
import { CVSchema } from '@/lib/validations/cv'
import LoadingSpinner from '@/components/ui/loading-spinner'

const steps = [
  { id: 1, title: 'CV Upload', schema: null },
  { id: 2, title: 'Personal Information', schema: personalInfoSchema },
  { id: 3, title: 'Education', schema: educationSchema },
  { id: 4, title: 'Experience & Skills', schema: experienceSchema },
  { id: 5, title: 'Preferences', schema: preferencesSchema }
]

const defaultValues = {
  // Personal Information
  name: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  linkedinUrl: '',
  profilePictureUrl: '',
  
  // Education
  education: '',
  university: '',
  degree: '',
  graduationYear: '',
  major: '',
  cvUrl: '',
  
  // Experience & Skills
  skills: [],
  interests: [],
  
  // Preferences
  lookingFor: '',
  preferredFields: [],
  availabilityType: '',
  preferredDuration: '',
  remotePreference: ''
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('')
  const [cvParsed, setCVParsed] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isSavingCV, setIsSavingCV] = useState(false)

  const form = useForm({
    resolver: zodResolver(completeOnboardingSchema),
    defaultValues,
    mode: 'onChange'
  })

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid }, 
    trigger, 
    watch, 
    setValue, 
    getValues 
  } = form

  const watchedValues = watch()

  // Alternative submit function that bypasses strict validation
  const handleFormSubmit = async () => {
    const formData = getValues()
    
    // Check for basic required fields manually
    const requiredFields = ['phone', 'bio', 'education', 'university', 'degree', 'graduationYear', 'major']
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '')
    
    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`)
      return
    }
    
    if (!formData.skills || formData.skills.length === 0) {
      alert('Please select at least one skill')
      return
    }
    
    if (!formData.interests || formData.interests.length === 0) {
      alert('Please select at least one interest')
      return
    }
    
    if (!formData.lookingFor || !formData.availabilityType || !formData.preferredDuration || !formData.remotePreference) {
      alert('Please complete all preference selections')
      return
    }
    
    await onSubmit(formData)
  }

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  const validateCurrentStep = async () => {
    const currentStepSchema = steps[currentStep - 1].schema
    if (!currentStepSchema) return true
    const currentStepFields = Object.keys(currentStepSchema.shape)
    
    const isValid = await trigger(currentStepFields)
    return isValid
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSkillToggle = (skill) => {
    const currentSkills = getValues('skills')
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill]
    setValue('skills', updatedSkills, { shouldValidate: true })
  }

  const handleInterestToggle = (interest) => {
    const currentInterests = getValues('interests')
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]
    setValue('interests', updatedInterests, { shouldValidate: true })
  }

  const handlePreferredFieldToggle = (field) => {
    const currentFields = getValues('preferredFields')
    const updatedFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field]
    setValue('preferredFields', updatedFields, { shouldValidate: true })
  }

  const ErrorMessage = ({ name }) => {
    const error = errors[name]
    return error ? (
      <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error.message}</p>
    ) : null
  }

  // Handler for CV upload and parsing
  const handleCVUploadAndParse = async (cvUrl) => {
    setIsParsing(true)
    try {
      // Call backend API to parse CV
      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvUrl })
      })
      const result = await response.json()
      if (response.ok && result.cvParsed) {
        // Validate with Zod
        const parsed = CVSchema.safeParse(result.cvParsed)
        if (parsed.success) {
          setCVParsed(parsed.data)
          // Store CV URL for later saving
          setValue('cvUrl', cvUrl, { shouldValidate: true })
        } else {
          // Show Zod errors
          alert('CV parsing failed: ' + parsed.error.errors.map(e => e.message).join(', '))
        }
      } else {
        alert('CV parsing failed: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      alert('CV parsing error: ' + err.message)
    } finally {
      setIsParsing(false)
    }
  }

  // Auto-fill form from parsed CV data
  const autoFillFromCV = () => {
    if (!cvParsed) return

    // Auto-fill personal information
    if (cvParsed.name) setValue('name', cvParsed.name, { shouldValidate: true })
    if (cvParsed.email) setValue('email', cvParsed.email, { shouldValidate: true })
    if (cvParsed.phone) setValue('phone', cvParsed.phone, { shouldValidate: true })
    if (cvParsed.location) setValue('location', cvParsed.location, { shouldValidate: true })
    if (cvParsed.summary) setValue('bio', cvParsed.summary, { shouldValidate: true })

    // Auto-fill education (use the first education entry if available)
    if (cvParsed.education && cvParsed.education.length > 0) {
      const edu = cvParsed.education[0]
      if (edu.degree) setValue('degree', edu.degree, { shouldValidate: true })
      if (edu.institution) setValue('university', edu.institution, { shouldValidate: true })
      if (edu.graduationYear) setValue('graduationYear', edu.graduationYear.toString(), { shouldValidate: true })
      if (edu.fieldOfStudy) setValue('major', edu.fieldOfStudy, { shouldValidate: true })
      
      // Set education level based on degree
      const degree = edu.degree.toLowerCase()
      if (degree.includes('bachelor')) setValue('education', "Bachelor's Degree", { shouldValidate: true })
      else if (degree.includes('master')) setValue('education', "Master's Degree", { shouldValidate: true })
      else if (degree.includes('phd') || degree.includes('doctorate')) setValue('education', 'PhD', { shouldValidate: true })
      else if (degree.includes('engineer') || degree.includes('engineering')) setValue('education', 'Engineering', { shouldValidate: true })
      else setValue('education', 'Other', { shouldValidate: true })
    }

    // Auto-fill skills
    if (cvParsed.skills && cvParsed.skills.length > 0) {
      setValue('skills', cvParsed.skills, { shouldValidate: true })
    }

    // Set some default interests based on skills (basic mapping)
    const techSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker']
    const hasTekhSkills = cvParsed.skills?.some(skill => 
      techSkills.some(techSkill => skill.toLowerCase().includes(techSkill.toLowerCase()))
    )
    if (hasTekhSkills) {
      setValue('interests', ['Technology'], { shouldValidate: true })
    }
  }

  // Modified nextStep to handle CV auto-fill
  const nextStep = async () => {
    // Special handling for CV upload step
    if (currentStep === 1) {
      if (cvParsed) {
        autoFillFromCV()
        setCurrentStep(2)
      } else {
        alert('Please upload and parse your CV first')
      }
      return
    }

    // Regular validation for other steps
    const currentStepSchema = steps[currentStep - 1].schema
    if (currentStepSchema) {
      const currentStepFields = Object.keys(currentStepSchema.shape)
      const isValid = await trigger(currentStepFields)
      if (isValid) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length))
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  // Modified onSubmit to include CV data
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      // Include parsed CV data in submission
      const submissionData = {
        ...data,
        cvParsed: cvParsed
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const responseData = await response.json()

      if (response.ok) {
        // Small delay before navigation to allow state updates
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } else {
        alert(`Failed to save profile: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert(`Error saving profile: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Upload Your CV
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Upload your CV/Resume (PDF) and we&apos;ll automatically extract your information to speed up the process.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              {isParsing ? (
                <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl p-8 text-center bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <LoadingSpinner showText={false} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Parsing CV...
                    </h3>
                  </div>
                </div>
              ) : !cvParsed ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <FileUpload
                    accept=".pdf,application/pdf"
                    maxSize="8MB"
                    fileType="cv"
                    onUploadComplete={async (result) => {
                      await handleCVUploadAndParse(result.ufsUrl)
                    }}
                  />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    We&apos;ll parse your CV and auto-fill the next steps for you to review and edit.
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      CV Parsed Successfully!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      We&apos;ve extracted your information from your CV. Click &ldquo;Continue&rdquo; to review and edit the auto-filled data.
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">Extracted Information:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {cvParsed.name && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">Name:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{cvParsed.name}</span>
                        </div>
                      )}
                      {cvParsed.email && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{cvParsed.email}</span>
                        </div>
                      )}
                      {cvParsed.phone && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{cvParsed.phone}</span>
                        </div>
                      )}
                      {cvParsed.education?.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">Education:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{cvParsed.education[0].degree}</span>
                        </div>
                      )}
                      {cvParsed.skills?.length > 0 && (
                        <div className="md:col-span-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Skills:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cvParsed.skills.slice(0, 6).map((skill, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                    {skill}
                                  </span>
                                ))}
                                {cvParsed.skills.length > 6 && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                    +{cvParsed.skills.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {watchedValues.cvUrl && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        <a 
                          href={watchedValues.cvUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          📄 View Uploaded CV
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tell us about yourself to create your professional profile
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture
                </label>
                
                {/* Profile Picture Preview */}
                {watchedValues.profilePictureUrl && (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <Image 
                        src={watchedValues.profilePictureUrl} 
                        alt="Profile" 
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-800"
                      />
                      <button
                        type="button"
                        onClick={() => setValue('profilePictureUrl', '', { shouldValidate: true })}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      ✓ Profile picture uploaded and account updated
                    </p>
                  </div>
                )}
                
                {/* Upload Component */}
                {!watchedValues.profilePictureUrl && (
                  <FileUpload
                    accept="image/*"
                    maxSize="4MB"
                    fileType="profile"
                    onUploadComplete={async (result) => {
                      setValue('profilePictureUrl', result.url, { shouldValidate: true });
                    }}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Your full name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage name="name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <ErrorMessage name="email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-lg mr-2">🇹🇳</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">+216</span>
                  </div>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="12345678"
                    className="w-full pl-20 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <ErrorMessage name="phone" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn URL (Optional)
                </label>
                <input
                  {...register('linkedinUrl')}
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <ErrorMessage name="linkedinUrl" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio *
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  placeholder="Tell us about yourself, your background, and what makes you unique..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <ErrorMessage name="bio" />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Education Background
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Share your educational journey and academic achievements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Education Level *
                </label>
                <select
                  {...register('education')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                  <option value="Master's Degree">Master&apos;s Degree</option>
                  <option value="Engineering">Engineering</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
                <ErrorMessage name="education" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  University/Institution *
                </label>
                <input
                  {...register('university')}
                  type="text"
                  placeholder="Your university or institution"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <ErrorMessage name="university" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Degree *
                </label>
                <input
                  {...register('degree')}
                  type="text"
                  placeholder="e.g., Computer Science, Engineering"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <ErrorMessage name="degree" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Graduation Year *
                </label>
                <input
                  {...register('graduationYear')}
                  type="text"
                  placeholder="2024"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <ErrorMessage name="graduationYear" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Major/Specialization *
              </label>
              <input
                {...register('major')}
                type="text"
                placeholder="Your major or area of specialization"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <ErrorMessage name="major" />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Skills & Experience
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Select your skills and interests to help us match you with the right opportunities
              </p>
            </div>

            {/* Skills Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills * (Select a category first)
              </label>
              <select
                value={selectedSkillCategory}
                onChange={(e) => setSelectedSkillCategory(e.target.value)}
                className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a skill category</option>
                {Object.keys(skillCategories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {selectedSkillCategory && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {skillCategories[selectedSkillCategory].map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        watchedValues.skills?.includes(skill)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}

              {watchedValues.skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <ErrorMessage name="skills" />
            </div>

            {/* Interests Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interests *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Research', 'Startups', 'Gaming'].map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      watchedValues.interests?.includes(interest)
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <ErrorMessage name="interests" />
            </div>
          </div>
        )

      case 5:
        const filteredCareerOpportunities = watchedValues.lookingFor 
          ? careerOpportunities[watchedValues.lookingFor] || []
          : []

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Your Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Help us match you with the right opportunities
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What are you looking for? *
                </label>
                <select
                  {...register('lookingFor')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select what you&apos;re looking for</option>
                  {Object.keys(careerOpportunities).map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <ErrorMessage name="lookingFor" />
              </div>

              {watchedValues.lookingFor && filteredCareerOpportunities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Fields/Types *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredCareerOpportunities.map(field => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => handlePreferredFieldToggle(field)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          watchedValues.preferredFields?.includes(field)
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-500'
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                  <ErrorMessage name="preferredFields" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Availability *
                  </label>
                  <select
                    {...register('availabilityType')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select availability</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  <ErrorMessage name="availabilityType" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Duration *
                  </label>
                  <select
                    {...register('preferredDuration')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select duration</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1+ years">1+ years</option>
                  </select>
                  <ErrorMessage name="preferredDuration" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Remote Work *
                  </label>
                  <select
                    {...register('remotePreference')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select preference</option>
                    <option value="on-site">On-site Only</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="no-preference">No Preference</option>
                  </select>
                  <ErrorMessage name="remotePreference" />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </div>
            </div>
            
            {/* Progress Bar Track */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Current Step Info */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  currentStep === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' :
                  currentStep === 2 ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white' :
                  currentStep === 3 ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' :
                  currentStep === 4 ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' :
                  'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                }`}>
                  {currentStep}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {steps[currentStep - 1].title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentStep === 1 && "Upload your CV to get started"}
                    {currentStep === 2 && "Tell us about yourself"}
                    {currentStep === 3 && "Share your educational background"}
                    {currentStep === 4 && "Highlight your skills and interests"}
                    {currentStep === 5 && "Set your internship preferences"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mini Steps Indicator */}
            <div className="flex items-center justify-center mt-6 space-x-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-green-500 scale-110'
                        : currentStep === step.id
                        ? 'bg-blue-500 scale-125 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 transition-colors ${
                      currentStep > step.id 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-8 md:p-12">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="px-4 sm:px-8 md:px-12 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-2 order-first sm:order-none">
                <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {currentStep < steps.length ? `${steps.length - currentStep} steps remaining` : 'Ready to complete'}
                </span>
              </div>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  {isSubmitting ? 'Completing...' : 'Complete Setup'}
                  {!isSubmitting && <Check className="w-4 h-4 ml-2" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
