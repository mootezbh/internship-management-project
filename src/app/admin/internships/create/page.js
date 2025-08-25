'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Calendar, Users, Clock, MapPin, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
// ...removed AdminLayout import...

export default function CreateInternshipPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learningPaths, setLearningPaths] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    capacity: '',
    location: '',
    field: '',
    startDate: '',
    endDate: '',
    learningPathId: ''
  });


  const fetchLearningPaths = async () => {
    try {
      const response = await fetch('/api/admin/learning-paths');
      if (response.ok) {
        const data = await response.json();
        setLearningPaths(data.learningPaths || []);
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.title || !formData.description || !formData.duration || 
        !formData.capacity || !formData.field) {
      toast.error('Please fill in all required fields');
      return;
    }

    const capacityNumber = parseInt(formData.capacity);
    const durationNumber = parseInt(formData.duration);

    if (isNaN(capacityNumber) || capacityNumber <= 0) {
      toast.error('Capacity must be a positive number');
      return;
    }

    if (isNaN(durationNumber) || durationNumber <= 0) {
      toast.error('Duration must be a positive number');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: capacityNumber,
          duration: durationNumber,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          learningPathId: formData.learningPathId || null
        }),
      });

      if (response.ok) {
        toast.success('Internship created successfully!');
        router.push('/admin/internships');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create internship');
      }
    } catch (error) {
      console.error('Error creating internship:', error);
      toast.error('Error creating internship');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  // ...existing code...
  // Remove duplicate/early return. Only keep the correct return statement at the end of the file.

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
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Create New Internship</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">Add a new internship opportunity</p>
        {/* Main Content */}
        <form id="create-internship-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Target className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Developer Intern"
                    required
                    className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="field" className="text-gray-700 dark:text-gray-300">
                    Field *
                  </Label>
                  <Input
                    id="field"
                    name="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    placeholder="e.g., Technology, Marketing, Design"
                    required
                    className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the internship opportunity, responsibilities, and requirements..."
                  rows={4}
                  required
                  className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Remote, New York, Hybrid"
                  className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Capacity and Duration */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Users className="w-5 h-5 mr-2" />
                Capacity & Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity" className="text-gray-700 dark:text-gray-300">
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
                    className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-gray-700 dark:text-gray-300">
                    Duration (weeks) *
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="Duration in weeks"
                    min="1"
                    required
                    className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Path */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Clock className="w-5 h-5 mr-2" />
                Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="learningPathId" className="text-gray-700 dark:text-gray-300">
                  Learning Path (Optional)
                </Label>
                <select
                  id="learningPathId"
                  name="learningPathId"
                  value={formData.learningPathId}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No learning path</option>
                  {learningPaths.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.title}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Associate a learning path with tasks for interns to complete
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Internship
                </>
              )}
            </Button>
          </div>
        </form>
      {/* ...existing code... */}
      </div>
    </div>
  );
}
