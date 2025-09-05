'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ApplicationReviewPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id;

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminCheck, setAdminCheck] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    status: '',
    feedback: ''
  });

  // Check admin status first
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      setAdminCheck(data);
      
      if (!data.isAdmin) {
        router.push('/dashboard');
        return;
      }
      
      // If admin check passes, fetch the application
      fetchApplication();
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/dashboard');
    }
  };
  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setReviewForm({
          status: data.status || '',
          feedback: data.feedback || ''
        });
      } else {
        toast.error('Failed to fetch application');
        router.push('/admin/applications');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Error loading application');
      router.push('/admin/applications');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, fetchApplication]);

  const handleSubmitReview = async () => {
    if (!reviewForm.status) {
      toast.error('Please select a status');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert status to correct action format
      const action = reviewForm.status === 'ACCEPTED' ? 'accept' : 'reject';
      
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          feedback: reviewForm.feedback
        })
      });

      if (response.ok) {
        toast.success('Application review submitted successfully!');
        router.push('/admin/applications');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">The application you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/applications')} variant="outline">
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Review Application</h1>
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <Badge variant={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300">{application ? `${application.user?.name} - ${application.internship?.title}` : 'Loading...'}</p>
        </div>
        {/* Main Content */}
        <div className="space-y-6">
          {/* Application Details */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">Applicant</Label>
                  <p className="text-slate-900 dark:text-white font-medium">{application.user?.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{application.user?.email}</p>
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">Internship</Label>
                  <p className="text-slate-900 dark:text-white font-medium">{application.internship?.title}</p>
                </div>
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">Applied At</Label>
                  <p className="text-slate-900 dark:text-white">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                {application.reviewedAt && (
                  <div>
                    <Label className="text-slate-700 dark:text-slate-300">Reviewed At</Label>
                    <p className="text-slate-900 dark:text-white">
                      {new Date(application.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Application Form Responses - Enhanced Display */}
              {application.responses && application.responses.length > 0 ? (
                <div className="mt-8">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <Label className="text-blue-800 dark:text-blue-200 text-lg font-semibold flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Application Form Responses ({application.responses.length})
                    </Label>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      Review the candidate&apos;s responses to the application form questions
                    </p>
                  </div>
                  <div className="space-y-6">
                    {application.responses.map((response, index) => (
                      <Card key={response.id} className="border-l-4 border-blue-500 dark:border-blue-400">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <Label className="text-slate-800 dark:text-slate-200 font-semibold text-base">
                              {index + 1}. {response.field?.label}
                              {response.field?.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              {response.field?.type?.toLowerCase()}
                            </Badge>
                          </div>
                          
                          {response.field?.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 italic">
                              {response.field.description}
                            </p>
                          )}
                          
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3">
                            {response.field?.type === 'FILE' ? (
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <a
                                  href={response.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  View uploaded file →
                                </a>
                              </div>
                            ) : (
                              <p className="text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                                {response.value || <span className="text-slate-500 dark:text-slate-400 italic">No response provided</span>}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No application form responses - This was a basic application
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Review Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Decision</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="ACCEPTED"
                      checked={reviewForm.status === 'ACCEPTED'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                    />
                    <span className="text-slate-900 dark:text-white">Accept</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      value="REJECTED"
                      checked={reviewForm.status === 'REJECTED'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      className="h-4 w-4 text-red-600 dark:text-red-400"
                    />
                    <span className="text-slate-900 dark:text-white">Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback" className="text-slate-700 dark:text-slate-300">
                  Feedback (Optional)
                </Label>
                <Textarea
                  id="feedback"
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  placeholder="Provide feedback to the applicant..."
                  rows={4}
                  className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => router.push('/admin/applications')}
                  variant="outline"
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !reviewForm.status}
                  className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
