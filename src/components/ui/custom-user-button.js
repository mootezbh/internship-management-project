'use client';

import { UserButton, useClerk } from '@clerk/nextjs';
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
  const dropdownRef = useRef(null);

  // Use only Clerk's default profile image
  const profileImageUrl = user?.imageUrl;

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
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {/* Custom Avatar Image */}
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
          {!imageError && profileImageUrl ? (
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
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={user?.emailAddresses?.[0]?.emailAddress}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
          
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
