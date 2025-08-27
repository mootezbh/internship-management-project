'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, GraduationCap, MapPin, Calendar, User, Building, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId;

  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      // Fetch user profile
      const userResponse = await fetch(`/api/admin/users/${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        toast.error('Failed to fetch user profile');
        router.push('/admin/users');
        return;
      }

      // Fetch user applications
      const applicationsResponse = await fetch(`/api/admin/users/${userId}/applications`);
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications || []);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error loading user profile');
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, fetchUserProfile]);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The user profile you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/users')} variant="outline">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  // Back button logic
  const handleBack = () => {
    const from = searchParams.get('from');
    if (from === 'admin-applications') {
      router.push('/admin/applications');
    } else {
      router.push('/admin/users');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button and Title */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center space-x-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
          <p className="text-gray-600 dark:text-slate-300">{user.name}</p>
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Full Name</label>
                    <p className="text-gray-900 dark:text-white">{user.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                        <p className="text-gray-900 dark:text-white">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Role</label>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {user.bio && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                    <p className="text-gray-900 dark:text-white mt-1">{user.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.university && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">University</label>
                      <p className="text-gray-900 dark:text-white">{user.university}</p>
                    </div>
                  )}
                  {user.degree && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Degree</label>
                      <p className="text-gray-900 dark:text-white">{user.degree}</p>
                    </div>
                  )}
                  {user.major && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Major</label>
                      <p className="text-gray-900 dark:text-white">{user.major}</p>
                    </div>
                  )}
                  {user.graduationYear && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Graduation Year</label>
                      <p className="text-gray-900 dark:text-white">{user.graduationYear}</p>
                    </div>
                  )}
                </div>

                {user.education && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Education</label>
                    <p className="text-gray-900 dark:text-white mt-1">{user.education}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills and Interests */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.skills && user.skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.interests && user.interests.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interests</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.preferredFields && user.preferredFields.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Fields</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.preferredFields.map((field, index) => (
                        <Badge key={index} variant="default">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.cvUrl && (
                  <Button
                    onClick={() => {
                      window.open(user.cvUrl, '_blank');
                      toast.success('Opening CV in new tab');
                    }}
                    variant="default"
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Open CV
                  </Button>
                )}
                {!user.cvUrl && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No CV uploaded</p>
                  </div>
                )}
                {user.linkedinUrl && (
                  <Button
                    onClick={() => window.open(user.linkedinUrl, '_blank')}
                    variant="outline"
                    className="w-full justify-start border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    LinkedIn Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Application Summary */}
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Application Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Applications:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{applications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Accepted:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {applications.filter(app => app.status === 'ACCEPTED').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">
                      {applications.filter(app => app.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rejected:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {applications.filter(app => app.status === 'REJECTED').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            {applications.length > 0 && (
              <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((application) => (
                      <div key={application.id} className="border-l-4 border-blue-200 dark:border-blue-600 pl-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {application.internship?.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(application.status)} className="text-xs">
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
