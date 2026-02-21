'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, LogOut, Menu, X, Dumbbell } from 'lucide-react';
import { NotificationDropdown } from '@/components/notifications';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                FitnessCoach
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated && user ? (
              user.role === 'client' ? (
                <>
                  <NavLink href="/client/dashboard">Dashboard</NavLink>
                  <NavLink href="/client/programs">My Programs</NavLink>
                  <NavLink href="/client/progress">Progress</NavLink>
                </>
              ) : (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/clients">Clients</NavLink>
                  <NavLink href="/programs">Programs</NavLink>
                  <NavLink href="/programs/assignments">Assignments</NavLink>
                  <NavLink href="/exercises">Exercises</NavLink>
                </>
              )
            ) : (
              <>
                <NavLink href="#features">Features</NavLink>
                <NavLink href="#about">About</NavLink>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded-md"></div>
                <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications - only show for trainers/admins */}
                {user.role !== 'client' && (
                  <NotificationDropdown />
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-semibold text-white">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button and notifications */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notifications - only show for trainers/admins */}
            {isAuthenticated && user && user.role !== 'client' && (
              <NotificationDropdown />
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated && user ? (
                user.role === 'client' ? (
                  <>
                    <MobileNavLink href="/client/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink href="/client/programs" onClick={() => setIsMenuOpen(false)}>
                      My Programs
                    </MobileNavLink>
                    <MobileNavLink href="/client/progress" onClick={() => setIsMenuOpen(false)}>
                      Progress
                    </MobileNavLink>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink href="/clients" onClick={() => setIsMenuOpen(false)}>
                      Clients
                    </MobileNavLink>
                    <MobileNavLink href="/programs" onClick={() => setIsMenuOpen(false)}>
                      Programs
                    </MobileNavLink>
                    <MobileNavLink href="/programs/assignments" onClick={() => setIsMenuOpen(false)}>
                      Assignments
                    </MobileNavLink>
                    <MobileNavLink href="/exercises" onClick={() => setIsMenuOpen(false)}>
                      Exercises
                    </MobileNavLink>
                  </>
                )
              ) : (
                <>
                  <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>
                    Features
                  </MobileNavLink>
                  <MobileNavLink href="#about" onClick={() => setIsMenuOpen(false)}>
                    About
                  </MobileNavLink>
                </>
              )}
              
              {user && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center px-3 py-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-white">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <MobileNavLink href="/profile" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </MobileNavLink>
                  <MobileNavLink href="/settings" onClick={() => setIsMenuOpen(false)}>
                    Settings
                  </MobileNavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:bg-red-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full text-center btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Desktop Navigation Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
    >
      {children}
    </Link>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
