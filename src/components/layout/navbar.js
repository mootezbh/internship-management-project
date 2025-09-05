'use client'

import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle'
import { CustomUserButton } from '@/components/ui/custom-user-button'
import { 
  Menu, 
  X, 
  Briefcase, 
  Users, 
  BookOpen, 
  FileText, 
  CheckSquare,
  LayoutDashboard,
  User,
  ShieldCheck
} from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path) => {
    // For admin routes, we need exact matching to avoid conflicts
    if (pathname.startsWith('/admin')) {
      return pathname === path
    }
    // For non-admin routes, allow sub-path matching
    return pathname === path || pathname.startsWith(path + '/')
  }

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {} finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  // Navigation items based on role
  const getNavigationItems = () => {
    if (isAdmin) {
      return [
        { 
          href: '/admin', 
          label: 'Dashboard', 
          icon: LayoutDashboard,
          active: isActive('/admin') && pathname === '/admin'
        },
        { 
          href: '/admin/users', 
          label: 'Users', 
          icon: Users,
          active: isActive('/admin/users') 
        },
        { 
          href: '/admin/internships', 
          label: 'Internships', 
          icon: Briefcase,
          active: isActive('/admin/internships') 
        },
        { 
          href: '/admin/learning-paths', 
          label: 'Learning Paths', 
          icon: BookOpen,
          active: isActive('/admin/learning-paths') 
        },
        { 
          href: '/admin/applications', 
          label: 'Applications', 
          icon: FileText,
          active: isActive('/admin/applications') 
        },
        { 
          href: '/admin/task-review', 
          label: 'Task Review', 
          icon: CheckSquare,
          active: isActive('/admin/task-review') 
        }
      ]
    } else {
      return [
        { 
          href: '/dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard,
          active: isActive('/dashboard') 
        },
        { 
          href: '/internships', 
          label: 'Internships', 
          icon: Briefcase,
          active: isActive('/internships') 
        },
        { 
          href: '/applications', 
          label: 'Applications', 
          icon: FileText,
          active: isActive('/applications') 
        }
      ]
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                InternHub
              </span>
            </Link>
            
            {/* Navigation Links - Desktop */}
            <SignedIn>
              <div className="hidden lg:block ml-10">
                <div className="flex items-center space-x-1">
                  {!isLoading && navigationItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          item.active
                            ? 'bg-blue-50 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-slate-700/50'
                            : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </SignedIn>
          </div>
          
          {/* Right Side - Auth, Theme, Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Admin Badge */}
            <SignedIn>
              {isAdmin && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white text-xs font-medium rounded-full shadow-lg">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Admin</span>
                </div>
              )}
            </SignedIn>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            
            {/* Auth Buttons */}
            <SignedOut>
              <SignInButton 
                mode="modal"
                forceRedirectUrl="/api/auth/redirect"
              >
                <button className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton 
                mode="modal"
                forceRedirectUrl="/api/auth/redirect"
              >
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Custom User Button */}
              <CustomUserButton />
            </SignedIn>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <SignedIn>
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {!isLoading && navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.active
                        ? 'bg-blue-50 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-slate-700/50'
                        : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Admin Badge in Mobile */}
              {isAdmin && (
                <div className="flex items-center justify-center mt-4 mb-2">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white text-sm font-medium rounded-full shadow-lg">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Access</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SignedIn>
    </nav>
  )
}
