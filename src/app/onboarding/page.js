'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import { SKILLS_CATEGORIES as skillCategories, CAREER_OPPORTUNITIES as careerOpportunities } from '@/lib/data/categories'
import { 
  personalInfoSchema, 
  educationSchema, 
  experienceSchema, 
  preferencesSchema,
  completeOnboardingSchema 
} from '@/lib/validations/onboarding'
import LoadingSpinner from '@/components/ui/loading-spinner'

const steps = [
  { id: 1, title: 'Personal Information', schema: personalInfoSchema },
  { id: 2, title: 'Education', schema: educationSchema },
  { id: 3, title: 'Experience & Skills', schema: experienceSchema },
  { id: 4, title: 'Preferences', schema: preferencesSchema }
]

const defaultValues = {
  // Step 1: Personal Information
  phone: '',
  bio: '',
  linkedinUrl: '',
  profilePictureUrl: '',
  
  // Step 2: Education
  education: '',
  university: '',
  degree: '',
  graduationYear: '',
  major: '',
  cvUrl: '',
  
  // Step 3: Experience & Skills
  skills: [],
  interests: [],
  
  // Step 4: Preferences
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
    const currentStepFields = Object.keys(currentStepSchema.shape)
    
    const isValid = await trigger(currentStepFields)
    return isValid
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        alert(`Failed to save profile: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert(`Error saving profile: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Let&apos;s get to know you
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us about yourself to create your profile
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
                      
                      // Update Clerk public metadata with customProfileImageUrl
                      try {
                        await fetch('/api/set-clerk-public-metadata', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ imageUrl: result.url })
                        });
                      } catch (metaError) {
                        // Silently handle metadata update error
                      }
                    }}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
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

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Education Background
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Share your educational journey
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CV/Resume (PDF)
              </label>
              <FileUpload
                accept=".pdf,application/pdf"
                maxSize="8MB"
                fileType="cv"
                onUploadComplete={(result) => setValue('cvUrl', result.url, { shouldValidate: true })}
              />
              {watchedValues.cvUrl && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700 dark:text-green-300">
                      ✓ CV uploaded successfully
                    </span>
                    <div className="flex gap-2">
                      <a 
                        href={watchedValues.cvUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View CV
                      </a>
                      <button
                        type="button"
                        onClick={() => setValue('cvUrl', '', { shouldValidate: true })}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Skills & Experience
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your CV and select your skills and interests
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

      case 4:
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
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep >= step.id 
                    ? 'text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Setup'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
