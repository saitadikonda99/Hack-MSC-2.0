'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/contexts/PointsContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { HiUser, HiMail, HiCalendar, HiUserCircle } from 'react-icons/hi';
import { PiCoin } from 'react-icons/pi';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { totalPoints, availablePoints, loading: pointsLoading } = usePoints();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Don't render if user is not authenticated (will be redirected by useEffect)
  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dashboard>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <HiUserCircle className="text-6xl text-zinc-800" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-zinc-300 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <HiUser className="text-2xl text-zinc-700 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 font-medium">Full Name</p>
                  <p className="text-lg text-zinc-900">{user.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <HiMail className="text-2xl text-zinc-700 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 font-medium">Email Address</p>
                  <p className="text-lg text-zinc-900">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <HiUserCircle className="text-2xl text-zinc-700 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 font-medium">Role</p>
                  <p className="text-lg text-zinc-900 capitalize">{user.role}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <HiCalendar className="text-2xl text-zinc-700 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 font-medium">Member Since</p>
                  <p className="text-lg text-zinc-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {/* Civic Points */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <PiCoin className="text-2xl text-amber-700 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-amber-700 font-medium">Civic Points</p>
                  <div className="flex items-baseline gap-4 mt-1">
                    <div>
                      <p className="text-sm text-amber-600">Available</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {pointsLoading ? '...' : availablePoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-amber-600">Total Earned</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {pointsLoading ? '...' : totalPoints}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-zinc-200">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
