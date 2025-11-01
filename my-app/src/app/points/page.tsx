'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import PointsDashboard from '@/app/components/dashboard/points-dashboard/points-dashboard';

export default function PointsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

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

  return (
    <Dashboard>
      <div className="OrganizationHomeComponent">
        <div className="OrganizationHomeComponent-in">
          <PointsDashboard />
        </div>
      </div>
    </Dashboard>
  );
}