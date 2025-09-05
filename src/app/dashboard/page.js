'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  FileText, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Lightbulb,
  ArrowRight,
  Star,
  Award,
  LayoutDashboard
} from 'lucide-react'
import { PageLoading } from '@/components/ui/loading-spinner'

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [learningProgress, setLearningProgress] = useState(null)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        // Check profile completion first
        const profileResponse = await fetch('/api/profile/check')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (!profileData.profileCompleted) {
            router.push('/onboarding')
            return
          }
        }

        // Fetch user applications for stats and recent activity
        const applicationsResponse = await fetch('/api/applications')
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          const applications = applicationsData.applications || []
          
          setStats({
            totalApplications: applications.length,
            pendingApplications: applications.filter(app => app.status === 'PENDING').length,
            acceptedApplications: applications.filter(app => app.status === 'ACCEPTED').length,
            rejectedApplications: applications.filter(app => app.status === 'REJECTED').length
          })
          
          // Get recent applications (last 3)
          const sortedApplications = applications
            .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            .slice(0, 3)
          setRecentApplications(sortedApplications)
        }

        // Fetch learning progress for accepted internships
        const acceptedInternships = await fetch('/api/applications?status=ACCEPTED')
        if (acceptedInternships.ok) {
          const acceptedData = await acceptedInternships.json()
          if (acceptedData.applications && acceptedData.applications.length > 0) {
            // Get progress for the first accepted internship
            const firstInternship = acceptedData.applications[0]
            if (firstInternship.internship?.id) {
              const progressResponse = await fetch(`/api/progress/${firstInternship.internship.id}`)
              if (progressResponse.ok) {
                const progressData = await progressResponse.json()
                setLearningProgress(progressData)
              }
            }
          }
        }
      } catch (error) {} finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router])

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Your Dashboard" 
        subtitle="Preparing your personalized internship dashboard and recent activity..."
        variant="primary"
        icon={LayoutDashboard}
      />
    )
  }

  return (
    <>
      <SignedIn>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, {user?.firstName || 'there'}!
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Here&apos;s what&apos;s happening with your internship journey.
              </p>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalApplications}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Applications submitted
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingApplications}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">Accepted</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.acceptedApplications}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Successful applications
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex flex-col items-center text-center flex-grow">
                      <Search className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                      <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Find Internships</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-grow">
                        Browse available internship opportunities
                      </p>
                      <Button 
                        onClick={() => router.push('/internships')}
                        className="w-full mt-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Browse
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex flex-col items-center text-center flex-grow">
                      <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                      <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">My Applications</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-grow">
                        Track your application status
                      </p>
                      <Button 
                        onClick={() => router.push('/applications')}
                        variant="outline"
                        className="w-full mt-auto border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        View All
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex flex-col items-center text-center flex-grow">
                      <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
                      <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Learning Paths</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-grow">
                        Access your learning materials
                      </p>
                      <Button 
                        onClick={() => router.push('/applications')}
                        variant="outline"
                        className="w-full mt-auto border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        disabled={stats.acceptedApplications === 0}
                      >
                        {stats.acceptedApplications > 0 ? 'Start Learning' : 'No Access Yet'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex flex-col items-center text-center flex-grow">
                      <User className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-3" />
                      <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Profile</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-grow">
                        Manage your profile settings
                      </p>
                      <Button 
                        onClick={() => router.push('/profile')}
                        variant="outline"
                        className="w-full mt-auto border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity and Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Applications */}
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Recent Applications
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">Your latest application activity</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/applications')}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900 dark:text-white">{app.internship?.title || 'Unknown Position'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Applied {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {app.status === 'PENDING' && (
                              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs">
                                <Clock className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                            {app.status === 'ACCEPTED' && (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                Accepted
                              </span>
                            )}
                            {app.status === 'REJECTED' && (
                              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs">
                                <AlertCircle className="h-3 w-3" />
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No applications yet</p>
                      <Button 
                        size="sm" 
                        className="mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        onClick={() => router.push('/internships')}
                      >
                        Find Internships
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Progress or Next Steps */}
              {learningProgress ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      Learning Progress
                    </CardTitle>
                    <CardDescription>Your current learning path status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span className="font-medium">{learningProgress.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${learningProgress.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Tasks Completed</p>
                          <p className="text-xs text-slate-600">{learningProgress.completedTasks} tasks done</p>
                        </div>
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => router.push('/applications')}
                      >
                        Continue Learning
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-orange-600" />
                      Next Steps
                    </CardTitle>
                    <CardDescription>Recommended actions for your journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.totalApplications === 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium">Start Your Journey</p>
                              <p className="text-xs text-slate-600">Browse and apply to your first internship</p>
                            </div>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => router.push('/internships')}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Find Internships
                          </Button>
                        </div>
                      ) : stats.acceptedApplications === 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium">Keep Applying</p>
                              <p className="text-xs text-slate-600">Apply to more positions to increase your chances</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/internships')}
                          >
                            Apply to More Positions
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium">Great Job!</p>
                              <p className="text-xs text-slate-600">You have active internships - continue your learning</p>
                            </div>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => router.push('/applications')}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Success Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Success Tips
                </CardTitle>
                <CardDescription>
                  Make your applications stand out and succeed in your internships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">Profile Excellence</span>
                    </div>
                    <p className="text-xs text-slate-600">Complete your profile with detailed skills, experience, and a professional bio to make a strong first impression.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Apply Early</span>
                    </div>
                    <p className="text-xs text-slate-600">Apply as soon as opportunities are posted. Early applications often receive more attention from recruiters.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">Match Requirements</span>
                    </div>
                    <p className="text-xs text-slate-600">Read job descriptions carefully and ensure you meet most requirements before applying to increase success rates.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
