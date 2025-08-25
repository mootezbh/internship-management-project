'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserProfile } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Bell, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    theme: 'system'
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserProfile();
    }
  }, [isLoaded, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (response.ok) {
        setPreferences(newPreferences);
        toast.success('Preferences updated successfully');
      } else {
        toast.error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Error updating preferences');
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Settings className="w-6 h-6 text-gray-700 dark:text-slate-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Settings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={profile.name || ''}
                        readOnly
                        className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={profile.email || ''}
                        readOnly
                        className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
                        Role
                      </Label>
                      <div className="mt-1">
                        <Badge variant={profile.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {profile.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To update your profile information, use the Account tab which provides
                    full profile management through Clerk.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your account details, security settings, and authentication methods.
                  </p>
                  <UserProfile 
                    appearance={{
                      baseTheme: 'dark',
                      elements: {
                        rootBox: 'mx-auto',
                        card: 'border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates about your applications and internships
                      </p>
                    </div>
                    <Button
                      variant={preferences.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updatePreferences({
                        ...preferences,
                        emailNotifications: !preferences.emailNotifications
                      })}
                    >
                      {preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get real-time notifications in your browser
                      </p>
                    </div>
                    <Button
                      variant={preferences.pushNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updatePreferences({
                        ...preferences,
                        pushNotifications: !preferences.pushNotifications
                      })}
                    >
                      {preferences.pushNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Export Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Download a copy of your data including applications and progress.
                    </p>
                    <Button variant="outline" className="border-gray-300 dark:border-slate-600">
                      Request Data Export
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
