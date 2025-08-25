'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Users, Clock, MapPin, Target, Edit, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function ViewInternshipPage() {
  const router = useRouter();
  const params = useParams();
  const internshipId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [internship, setInternship] = useState(null);
  const [applications, setApplications] = useState([]);

  const fetchInternship = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/internships/${internshipId}`);
      if (response.ok) {
        const data = await response.json();
        setInternship(data.internship);
      } else {
        toast.error('Failed to fetch internship');
        router.push('/admin/internships');
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      toast.error('Error loading internship');
      router.push('/admin/internships');
    }
  }, [internshipId, router]);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/applications?internshipId=${internshipId}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    Promise.all([
      fetchInternship(),
      fetchApplications()
    ]);
  }, [fetchInternship, fetchApplications]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Internship Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The internship you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/internships')} variant="outline">
            Back to Internships
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title in container */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            onClick={() => router.push('/admin/internships')}
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Internships
          </Button>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">Internship Details</span>
          <Button
            onClick={() => router.push(`/admin/internships/${internshipId}/edit`)}
            className="ml-auto bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Internship
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Internship Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-white">
                  <Target className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {internship.title}
                  </h3>
                  <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {internship.field}
                  </Badge>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {internship.description}
                  </p>
                </div>
                {internship.location && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {internship.location}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Path */}
            {internship.learningPath && (
              <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900 dark:text-white">
                    <Clock className="w-5 h-5 mr-2" />
                    Learning Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {internship.learningPath.title}
                    </h4>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      {internship.learningPath.tasks?.length || 0} tasks
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {internship.learningPath.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Applications */}
            <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-white">
                  <FileText className="w-5 h-5 mr-2" />
                  Applications ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-6">
                    No applications yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {application.user?.name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Applied {formatDate(application.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                          <Button
                            onClick={() => router.push(`/admin/applications/${application.id}/review`)}
                            variant="outline"
                            size="sm"
                            className="border-slate-700 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-white">
                  <Users className="w-5 h-5 mr-2" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Capacity:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {internship.capacity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Applications:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {applications.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Available Spots:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {Math.max(0, internship.capacity - applications.filter(app => app.status === 'ACCEPTED').length)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {internship.duration} weeks
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Start Date:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(internship.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">End Date:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(internship.endDate)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push(`/admin/internships/${internshipId}/application-form`)}
                  variant="outline"
                  className="w-full justify-start border-slate-700 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Setup Application Form
                </Button>
                <Button
                  onClick={() => router.push(`/admin/applications?internship=${internshipId}`)}
                  variant="outline"
                  className="w-full justify-start border-slate-700 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View All Applications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}