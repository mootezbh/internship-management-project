'use client';

import { useClerk } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function CustomUserButton() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [customProfileImage, setCustomProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [profileImageReady, setProfileImageReady] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch custom profile image from database
  const fetchCustomProfile = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profileData = await response.json();
        setCustomProfileImage(profileData.profilePictureUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
      setProfileImageReady(true);
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      fetchCustomProfile();
    } else if (isSignedIn) {
      // If signed in but no user data yet, set ready but keep loading
      setIsLoading(false);
      setProfileImageReady(true);
    }
  }, [user?.id, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Expose refresh function globally for other components to call
  useEffect(() => {
    window.refreshUserProfile = async () => {
      setIsLoading(true);
      setProfileImageReady(false);
      await fetchCustomProfile();
    };
    return () => {
      delete window.refreshUserProfile;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Use custom profile image if available, otherwise fall back to Clerk's default
  // Only show image once we've determined which one to use
  const profileImageUrl = profileImageReady ? (customProfileImage || user?.imageUrl) : null;

  // Reset image error when user or profile image changes
  useEffect(() => {
    setImageError(false);
  }, [profileImageUrl, user?.id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isSignedIn) return null;

  const handleSignOut = async () => {
    setIsOpen(false); // Close dropdown immediately
    await signOut({ redirectUrl: '/' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {/* Custom Avatar Image */}
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 hover:shadow-lg transition-shadow">
          {!isLoading && !imageError && profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={`${user?.firstName || 'User'}'s profile`}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              priority={false}
              unoptimized={profileImageUrl?.includes('clerk')} // Use unoptimized for Clerk images
            />
          ) : (
            <div className="w-full h-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
              {isLoading ? (
                <div className="w-4 h-4 border border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              )}
            </div>
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-600 z-50">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-600">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={user?.emailAddresses?.[0]?.emailAddress}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
          
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
