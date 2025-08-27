'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import FormRenderer from '@/components/form-builder/FormRenderer';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const internshipId = params.id;
  
  const [internship, setInternship] = useState(null);
  const [applicationForm, setApplicationForm] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch internship details
      const internshipResponse = await fetch(`/api/internships/${internshipId}`);
      if (internshipResponse.ok) {
        const internshipData = await internshipResponse.json();
        setInternship(internshipData);
      }

      // Fetch application form
      const formResponse = await fetch(`/api/internships/${internshipId}/application-form`);
      if (formResponse.ok) {
        const formData = await formResponse.json();
        setApplicationForm(formData);
      } else if (formResponse.status === 404) {
        // No custom form exists, user can apply with basic application
        setApplicationForm(null);
      }

      // Check if user already applied
      const applicationResponse = await fetch(`/api/internships/${internshipId}/apply`);
      if (applicationResponse.ok) {
        const applicationData = await applicationResponse.json();
        // If applied, set application object, else set null
        if (applicationData.applied) {
          setExistingApplication({
            application: {
              status: applicationData.status,
              appliedAt: applicationData.application?.appliedAt || new Date().toISOString(),
              reviewedAt: applicationData.application?.reviewedAt,
              feedback: applicationData.application?.feedback,
            },
            responses: applicationData.responses || [],
          });
        } else {
          setExistingApplication(null);
        }
      }

    } catch (error) {
      // Error fetching data
    } finally {
      setIsLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (responses) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/internships/${internshipId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus('success');
        setExistingApplication({
          application: {
            id: result.application?.id || result.applicationId,
            status: result.application?.status || 'PENDING',
            appliedAt: result.application?.appliedAt || new Date().toISOString(),
            reviewedAt: result.application?.reviewedAt,
            feedback: result.application?.feedback,
          },
          responses: result.responses || [],
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBasicApplication = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/internships/${internshipId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses: {} }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus('success');
        setExistingApplication({
          application: {
            id: result.application?.id || result.applicationId,
            status: result.application?.status || 'PENDING',
            appliedAt: result.application?.appliedAt || new Date().toISOString(),
            reviewedAt: result.application?.reviewedAt,
            feedback: result.application?.feedback,
          },
          responses: result.responses || [],
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Internship Not Found</h2>
          <p className="text-gray-600 mb-4">The internship you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Apply for Internship
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {internship.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
  {existingApplication && existingApplication.application && existingApplication.application.status ? (
          /* Already Applied */
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Application Submitted
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your application has been submitted successfully.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <p className={`text-sm capitalize ${
                    existingApplication.application.status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-500' :
                    existingApplication.application.status === 'ACCEPTED' ? 'text-green-600 dark:text-green-500' :
                    'text-red-600 dark:text-red-500'
                  }`}>
                    {existingApplication.application.status.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Applied At</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(existingApplication.application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                {existingApplication.application.reviewedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reviewed At</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(existingApplication.application.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              {existingApplication.application.feedback && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {existingApplication.application.feedback}
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => router.push('/applications')}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              View All Applications
            </button>
          </div>
        ) : (
          /* Application Form */
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            {/* Internship Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {internship.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {internship.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">{internship.duration} weeks</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Capacity:</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">{internship.capacity} interns</span>
                </div>
                {internship.location && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">{internship.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Form or Basic Application */}
            {applicationForm && applicationForm.fields && Array.isArray(applicationForm.fields) && applicationForm.fields.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {applicationForm.title}
                </h3>
                {applicationForm.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {applicationForm.description}
                  </p>
                )}
                
                <FormRenderer
                  fields={applicationForm.fields}
                  onSubmit={handleSubmit}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Apply?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  No additional information is required for this internship. Click below to submit your application.
                </p>
                
                <button
                  onClick={handleBasicApplication}
                  disabled={isSubmitting}
                  className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            )}

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-800 dark:text-green-300">
                    Your application has been submitted successfully!
                  </p>
                </div>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-800 dark:text-red-300">
                    There was an error submitting your application. Please try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
