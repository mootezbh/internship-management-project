'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
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
  const [reviewForm, setReviewForm] = useState({
    status: '',
    feedback: ''
  });

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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The application you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/applications')} variant="outline">
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Application</h1>
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <Badge variant={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{application ? `${application.user?.name} - ${application.internship?.title}` : 'Loading...'}</p>
        </div>
        {/* Main Content */}
        {/* Application Details */}
        <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Applicant</Label>
                <p className="text-gray-900 dark:text-white font-medium">{application.user?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{application.user?.email}</p>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Internship</Label>
                <p className="text-gray-900 dark:text-white font-medium">{application.internship?.title}</p>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Applied At</Label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(application.appliedAt).toLocaleDateString()}
                </p>
              </div>
              {application.reviewedAt && (
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Reviewed At</Label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(application.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Form Responses */}
            {application.responses && application.responses.length > 0 && (
              <div className="mt-6">
                <Label className="text-gray-700 dark:text-gray-300 text-base font-medium">
                  Application Form Responses
                </Label>
                <div className="mt-3 space-y-4">
                  {application.responses.map((response) => (
                    <div key={response.id} className="border-l-4 border-blue-200 dark:border-blue-600 pl-4">
                      <Label className="text-gray-700 dark:text-gray-300 font-medium">
                        {response.field?.label}
                        {response.field?.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="mt-1 text-gray-900 dark:text-white">
                        {response.field?.type === 'FILE' ? (
                          <a
                            href={response.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View uploaded file
                          </a>
                        ) : (
                          <p className="whitespace-pre-wrap">{response.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Review Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Decision</Label>
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
                  <span className="text-gray-900 dark:text-white">Accept</span>
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
                  <span className="text-gray-900 dark:text-white">Reject</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-gray-700 dark:text-gray-300">
                Feedback (Optional)
              </Label>
              <Textarea
                id="feedback"
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                placeholder="Provide feedback to the applicant..."
                rows={4}
                className="mt-1 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => router.push('/admin/applications')}
                variant="outline"
                className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || !reviewForm.status}
                className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
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
  );
}
