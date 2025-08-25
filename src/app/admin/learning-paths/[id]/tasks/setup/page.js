'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';
import TaskBuilder from '@/components/task-builder/TaskBuilder';

export default function SetupTasksPage() {
  const router = useRouter();
  const params = useParams();
  const pathId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [tasks, setTasks] = useState([]);

  const fetchLearningPath = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}`);
      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
        setTasks(data.learningPath.tasks || []);
      } else {
        toast.error('Learning path not found');
        router.push('/admin/learning-paths');
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
      toast.error('Failed to load learning path');
    } finally {
      setIsLoading(false);
    }
  }, [pathId, router]);

  useEffect(() => {
    fetchLearningPath();
  }, [fetchLearningPath]);

  const handleSaveTasks = async (newTasks) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/learning-paths/${pathId}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks })
      });
      if (response.ok) {
        toast.success('Tasks updated successfully!');
        setTasks(newTasks);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update tasks');
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
      toast.error('Failed to save tasks');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Learning Path Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The learning path you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/learning-paths')} variant="outline">
            Back to Learning Paths
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Sticky Back Button */}
      <div className="sticky top-0 z-20 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 shadow-sm py-2 px-4">
        <Button
          onClick={() => router.push(`/admin/learning-paths/${pathId}/tasks`)}
          variant="outline"
          size="sm"
          className="border-slate-700 dark:border-slate-700 text-slate-200 dark:text-slate-200 hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Task Builder</h1>
            <p className="text-md text-slate-600 dark:text-slate-400">Setup and organize tasks for <span className="font-semibold text-blue-600 dark:text-blue-400">{learningPath.title}</span></p>
          </div>
          <Button
            onClick={() => handleSaveTasks(tasks)}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Tasks
              </>
            )}
          </Button>
        </div>
        <div className="rounded-xl shadow-lg border border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900/70 backdrop-blur-md p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Drag & Drop Task Builder
          </h2>
          <TaskBuilder
            initialTasks={tasks}
            onSave={newTasks => setTasks(newTasks)}
          />
        </div>
      </div>
    </div>
  );
}
