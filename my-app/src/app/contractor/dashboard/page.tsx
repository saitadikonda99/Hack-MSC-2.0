'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import './page.css';

interface ContractorProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
}

export default function ContractorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'contractor')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'contractor') {
      fetchContractorProfile();
    }
  }, [user]);

  const fetchContractorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contractor/profile');
      const data = await response.json();

      if (response.ok) {
        setProfile(data.contractor);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && user.role !== 'contractor')) {
    return null;
  }

  const dashboardContent = (
    <div className="contractor-dashboard">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-800">Contractor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading profile...</div>
      ) : profile ? (
        <>
          {/* Profile Overview */}
          <div className="profile-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Status</div>
                <div className={`stat-value status-${profile.status}`}>
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Rating</div>
                <div className="stat-value">⭐ {profile.rating?.toFixed(1) || '0.0'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Completed Jobs</div>
                <div className="stat-value text-green-600">{profile.completedJobs}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Jobs</div>
                <div className="stat-value text-blue-600">{profile.totalJobs}</div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <h2 className="section-title">Profile Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{profile.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{profile.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{profile.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Availability:</span>
                <span className={`availability-badge ${profile.isAvailable ? 'available' : 'unavailable'}`}>
                  {profile.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {profile.latitude && profile.longitude && (
                <div className="detail-item full-width">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="quick-info">
            <h2 className="section-title">Quick Info</h2>
            <div className="info-box">
              <p>🔐 <strong>Default Password:</strong> If you haven't changed your password yet, please update it for security.</p>
              <p>📱 <strong>Contact:</strong> Super admins can reach you at {profile.phone}</p>
              <p>📍 <strong>Location:</strong> Your location is used to assign nearby jobs</p>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">No profile found</div>
      )}
    </div>
  );

  return <Dashboard role={user?.role || 'contractor'}>{dashboardContent}</Dashboard>;
}
