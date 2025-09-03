import { z } from 'zod'

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  phone: z.string()
    .min(8, 'Phone number must be at least 8 digits')
    .max(15, 'Phone number is too long'),
  bio: z.string()
    .min(20, 'Bio must be at least 20 characters')
    .max(500, 'Bio must not exceed 500 characters'),
  linkedinUrl: z.string().optional().or(z.literal('')),
  profilePictureUrl: z.string().optional().or(z.literal(''))
})

// Step 2: Education & Background
export const educationSchema = z.object({
  education: z.string()
    .min(1, 'Please select your education level'),
  university: z.string()
    .min(2, 'University name is required')
    .max(100, 'University name must not exceed 100 characters'),
  degree: z.string()
    .min(2, 'Degree is required')
    .max(100, 'Degree must not exceed 100 characters'),
  major: z.string()
    .min(2, 'Major is required')
    .max(100, 'Major must not exceed 100 characters'),
  graduationYear: z.string()
    .regex(/^\d{4}$/, 'Please enter a valid year (YYYY)')
    .refine((year) => {
      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear()
      return yearNum >= 1980 && yearNum <= currentYear + 10
    }, 'Graduation year must be between 1980 and 10 years from now'),
  cvUrl: z.string().optional().or(z.literal(''))
})

// Step 3: Experience & Skills
export const experienceSchema = z.object({
  skills: z.array(z.string())
    .min(1, 'Please select at least 1 skill'),
  interests: z.array(z.string())
    .min(1, 'Please select at least 1 interest')
    .max(10, 'Please select no more than 10 interests')
})

// Step 4: Career Preferences
export const preferencesSchema = z.object({
  lookingFor: z.string()
    .min(1, 'Please select what you are looking for')
    .refine((val) => ['internship', 'entry_level', 'contract', 'freelance'].includes(val), {
      message: 'Please select a valid option'
    }),
  preferredFields: z.array(z.string())
    .min(1, 'Please select at least 1 preferred field')
    .max(8, 'Please select no more than 8 preferred fields'),
  availabilityType: z.string()
    .min(1, 'Please select your availability type')
    .refine((val) => ['full-time', 'part-time', 'flexible'].includes(val), {
      message: 'Please select a valid availability type'
    }),
  preferredDuration: z.string()
    .min(1, 'Please specify your preferred duration'),
  remotePreference: z.string()
    .min(1, 'Please select your remote work preference')
    .refine((val) => ['remote', 'on-site', 'hybrid', 'no-preference'].includes(val), {
      message: 'Please select a valid remote work preference'
    })
})

// Complete form schema for React Hook Form
export const completeOnboardingSchema = personalInfoSchema
  .merge(educationSchema)
  .merge(experienceSchema)
  .merge(preferencesSchema)
