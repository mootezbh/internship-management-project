'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Calendar, Users, Clock, MapPin, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function EditInternshipPage() {
  const router = useRouter();
  const params = useParams();
  const internshipId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learningPaths, setLearningPaths] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    capacity: '',
    location: '',
    field: '',
    endDate: '',
    learningPathId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internshipRes, learningPathsRes] = await Promise.all([
          fetch(`/api/admin/internships/${internshipId}`),
          fetch('/api/admin/learning-paths')
        ]);

        if (internshipRes.ok) {
          const internshipData = await internshipRes.json();
          const internship = internshipData.internship;
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };
          setFormData({
            title: internship.title || '',
            description: internship.description || '',
            duration: internship.duration || '',
            capacity: internship.capacity?.toString() || '',
            location: internship.location || '',
            field: internship.field || '',
            endDate: formatDate(internship.endDate),
            learningPathId: internship.learningPathId || ''
          });
        } else {
          toast.error('Failed to load internship data');
          router.push('/admin/internships');
        }
        if (learningPathsRes.ok) {
          const learningPathsData = await learningPathsRes.json();
          setLearningPaths(Array.isArray(learningPathsData.learningPaths) ? learningPathsData.learningPaths : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    if (internshipId) {
      fetchData();
    }
  }, [internshipId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/internships/${internshipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, capacity: parseInt(formData.capacity) || 0 }),
      });
      if (response.ok) {
        toast.success('Internship updated successfully!');
        router.push('/admin/internships');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update internship');
      }
    } catch (error) {
      console.error('Error updating internship:', error);
      toast.error('Failed to update internship');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner text="Loading Internship" icon={Target} />
    );
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
          <span className="text-2xl font-bold text-slate-900 dark:text-white">Edit Internship</span>
          <Button 
            type="submit" 
            form="edit-internship-form"
            disabled={isSubmitting}
            className="ml-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Internship
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">Update internship details and requirements</p>
        {/* Main Content */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Internship Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="edit-internship-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-900 dark:text-white">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter internship title"
                    required
                    className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field" className="text-slate-900 dark:text-white">Field *</Label>
                  <Input
                    id="field"
                    name="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Development, Data Science"
                    required
                    className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-900 dark:text-white">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the internship program, responsibilities, and benefits"
                  rows={4}
                  required
                  className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-900 dark:text-white flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Duration *
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 months, 6 weeks"
                    required
                    className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-slate-900 dark:text-white flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    Capacity *
                  </Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Number of interns"
                    min="1"
                    required
                    className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-900 dark:text-white flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Remote, New York, Hybrid"
                    required
                    className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-slate-900 dark:text-white flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              
              {/* Learning Path */}
              <div className="space-y-2">
                <Label htmlFor="learningPathId" className="text-slate-900 dark:text-white">Learning Path (Optional)</Label>
                <select
                  id="learningPathId"
                  name="learningPathId"
                  value={formData.learningPathId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="">Select a learning path (optional)</option>
                  {learningPaths.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.title}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Associate this internship with a learning path to provide structured tasks and content.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
