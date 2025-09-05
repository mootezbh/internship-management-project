'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Users, 
  UserCheck, 
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Calendar,
  Award,
  Trash2
} from 'lucide-react'
import { toast } from "sonner"
import { PageLoading } from '@/components/ui/loading-spinner'

// Badge component
const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variantClasses = {
    default: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300",
    success: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    warning: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    destructive: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
  }
  
  // Ensure children is safely rendered
  const safeChildren = children == null ? '' : String(children)
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {safeChildren}
    </span>
  )
}

// Dialog components
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>
const DialogTitle = ({ children }) => <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{children}</h2>
const DialogContent = ({ children }) => <div>{children}</div>

export default function AdminUsersPage() {
  const [showMakeAdminDialog, setShowMakeAdminDialog] = useState(false)
  const [userToMakeAdmin, setUserToMakeAdmin] = useState(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [makeAdminConfirmText, setMakeAdminConfirmText] = useState("")
  const { user } = useUser()
  const [currentUserRole, setCurrentUserRole] = useState(null)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Check if user is admin and get role
        const adminCheckRes = await fetch('/api/admin/check')
        const adminCheck = await adminCheckRes.json()

        if (!adminCheckRes.ok || !adminCheck.isAdmin) {
          router.push('/dashboard')
          return
        }
        // Set current user role (supports SUPER_ADMIN)
        setCurrentUserRole(adminCheck.role || (adminCheck.isSuperAdmin ? 'SUPER_ADMIN' : (adminCheck.isAdmin ? 'ADMIN' : 'INTERN')))

        // Fetch users
        const usersRes = await fetch('/api/admin/users')
        if (usersRes.ok) {
          const data = await usersRes.json()
          const usersArray = Array.isArray(data.users) ? data.users : []
          setUsers(usersArray)
          setFilteredUsers(usersArray)
        } else {
          setUsers([])
          setFilteredUsers([])
        }
      } catch (error) {
        toast.error('Failed to load users data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  // Filter users based on search and filters
  useEffect(() => {
    if (!Array.isArray(users)) return;
    let filtered = users.filter(user => user && typeof user === 'object');

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.university && user.university.toLowerCase().includes(term)) ||
        (user.major && user.major.toLowerCase().includes(term))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (roleFilter === 'SUPER_ADMIN') return user.role === 'SUPER_ADMIN';
        if (roleFilter === 'ADMIN') return user.role === 'ADMIN';
        if (roleFilter === 'INTERN') return user.role === 'INTERN';
        return true;
      });
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'complete') {
        filtered = filtered.filter(user => user.profileComplete === true);
      } else if (statusFilter === 'incomplete') {
        filtered = filtered.filter(user => user.profileComplete !== true);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleViewUser = (user) => {
    if (user && typeof user === 'object' && user.id) {
      // Navigate to user profile page instead of opening dialog
      router.push(`/admin/users/${user.id}/profile`)
    } else {
      toast.error('Invalid user data')
    }
  }

  const handleOpenCV = (cvUrl) => {
    if (cvUrl) {
      window.open(cvUrl, '_blank')
    } else {
      toast.error('No CV available to view')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    if (deleteConfirmText !== "DELETEUSER") {
      toast.error('You must type DELETEUSER to confirm deletion.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || 'User deleted successfully!')
        setShowDeleteDialog(false)
        setUserToDelete(null)
        setDeleteConfirmText("")
        // Refresh users list
        const usersRes = await fetch('/api/admin/users')
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        }
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch (error) {toast.error('Failed to delete user')}
    finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleRole = async (userId, currentRole) => {
    // Only super admin can make admin, so show confirmation dialog
    if (currentUserRole === 'SUPER_ADMIN' && currentRole !== 'ADMIN') {
      // Find user name from users array
      const userObj = users.find(u => u.id === userId)
      setUserToMakeAdmin({ id: userId, name: userObj?.name || '', currentRole })
      setShowMakeAdminDialog(true)
      setMakeAdminConfirmText("")
      return
    }
    // Otherwise, proceed as before
    const newRole = currentRole === 'ADMIN' ? 'INTERN' : 'ADMIN'
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || `User role updated to ${newRole}`)
        // Refresh users list
        const usersRes = await fetch('/api/admin/users')
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        }
      } else {
        toast.error(data.error || 'Failed to update user role')
      }
    } catch (error) {toast.error('Failed to update user role')}
    setShowMakeAdminDialog(false)
    setUserToMakeAdmin(null)
    setMakeAdminConfirmText("")
  }
  const handleMakeAdmin = async () => {
    if (!userToMakeAdmin) return
    if (makeAdminConfirmText !== "CREATEADMIN") {
      toast.error('You must type CREATEADMIN to confirm.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${userToMakeAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'ADMIN' })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || 'User promoted to admin!')
        setShowMakeAdminDialog(false)
        setUserToMakeAdmin(null)
        setMakeAdminConfirmText("")
        // Refresh users list
        const usersRes = await fetch('/api/admin/users')
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        }
      } else {
        toast.error(data.error || 'Failed to promote user')
      }
    } catch (error) {toast.error('Failed to promote user')}
    finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (user) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  if (isLoading) {
    return (
      <PageLoading 
        title="Loading Users" 
        subtitle="Fetching user data and preparing the management interface..."
        variant="primary"
        icon={Users}
      />
    )
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin Dashboard</span>
              </Button>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Manage and view all registered users</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 min-w-[180px] max-w-full">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Array.isArray(users) ? users.length : 0}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 min-w-[180px] max-w-full">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <UserCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Array.isArray(users) ? users.filter(u => u && u.profileComplete).length : 0}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Complete Profiles</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 min-w-[180px] max-w-full">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <GraduationCap className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Array.isArray(users) ? users.filter(u => u && u.role === 'INTERN').length : 0}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Interns</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 min-w-[180px] max-w-full">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                    <Award className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Array.isArray(users) ? users.filter(u => u && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')).length : 0}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Admins</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-slate-900 dark:text-white">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, university..."
                      className="pl-10 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role-filter" className="text-slate-900 dark:text-white">Role</Label>
                  <select
                    id="role-filter"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="INTERN">Interns</option>
                    <option value="ADMIN">Admins</option>
                    <option value="SUPER_ADMIN">Super Admins</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="status-filter" className="text-slate-900 dark:text-white">Profile Status</Label>
                  <select
                    id="status-filter"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="complete">Complete</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setRoleFilter('all')
                      setStatusFilter('all')
                    }}
                    className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400">
              {Array.isArray(filteredUsers) ? filteredUsers.length : 0} {(Array.isArray(filteredUsers) && filteredUsers.length === 1) ? 'user' : 'users'} found
            </p>
          </div>

          {/* Users List */}
          {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((userData, index) => (
                <Card key={userData?.id || `user-${index}`} className="hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{userData.name || 'Unknown User'}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{userData.email || 'No email'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={userData.role === 'ADMIN' ? 'destructive' : 'default'}>
                              {userData.role || 'INTERN'}
                            </Badge>
                            <Badge variant={userData.profileComplete ? 'success' : 'warning'}>
                              {userData.profileComplete ? 'Complete' : 'Incomplete'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                          {userData.university && (
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4" />
                              <span>{userData.university}</span>
                            </div>
                          )}
                          {userData.major && (
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4" />
                              <span>{userData.major}</span>
                            </div>
                          )}
                          {userData.graduationYear && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Graduating {String(userData.graduationYear)}</span>
                            </div>
                          )}
                          {userData.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{userData.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {userData.cvUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCV(userData.cvUrl)}
                            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Open CV
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(userData)}
                          className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {/* Only show Make Admin/Make Intern button if current user is SUPER_ADMIN, not editing self, and not same role */}
                        {currentUserRole === 'SUPER_ADMIN' && userData.id !== user?.id && userData.role !== currentUserRole && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleRole(userData.id, userData.role)}
                            className={userData.role === 'ADMIN' ? 'border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'}
                          >
                            Make {userData.role === 'ADMIN' ? 'Intern' : 'Admin'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(userData)}
                          className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Users Found</h3>
                <p className="text-slate-600 dark:text-slate-400">No users match your current filters.</p>
              </CardContent>
            </Card>
          )}



          {/* Make Admin Confirmation Dialog */}
          <Dialog open={showMakeAdminDialog} onOpenChange={setShowMakeAdminDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Promote to Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate-700">
                  To confirm promoting <strong>{userToMakeAdmin?.name || userToMakeAdmin?.id}</strong> to admin, type <span className="font-mono font-bold text-blue-600">CREATEADMIN</span> below:
                </p>
                <Input
                  value={makeAdminConfirmText}
                  onChange={e => setMakeAdminConfirmText(e.target.value)}
                  placeholder="Type CREATEADMIN to confirm"
                  className="border-slate-300 dark:border-slate-600"
                  autoFocus
                />
                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" onClick={() => setShowMakeAdminDialog(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleMakeAdmin} disabled={isSubmitting || makeAdminConfirmText !== "CREATEADMIN"} className="bg-green-600 hover:bg-green-700 text-white">{isSubmitting ? 'Promoting...' : 'Promote to Admin'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Delete User Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate-700">
                  Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>? 
                  This action cannot be undone and will permanently remove the user and all their associated data.
                </p>
                {userToDelete?.role === 'ADMIN' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ <strong>Warning:</strong> You are about to delete an admin user. This will remove their administrative privileges.
                    </p>
                  </div>
                )}
                <div className="space-y-2 w-full max-w-md mx-auto">
                  <Label htmlFor="delete-confirm" className="block text-slate-900 dark:text-white mb-1">Type <span className="font-mono font-bold text-red-600">DELETEUSER</span> to confirm:</Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETEUSER to confirm"
                    className="border-slate-300 dark:border-slate-600 w-full"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDeleteUser}
                    disabled={isSubmitting || deleteConfirmText !== "DELETEUSER"}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete User'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SignedIn>
  )
}
