// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import NavigationTabs from '@/app/components/dashboard/navigation-tabs/navigation-tabs';
import StatsBar from '@/app/components/dashboard/stats-bar/stats-bar';
import UploadTab from '@/app/components/dashboard/upload-tab/upload-tab';
import GalleryTab from '@/app/components/dashboard/gallery-tab/gallery-tab';

interface Report {
  id: number;
  lat: number;
  lng: number;
  issueType: string;
  severity: number;
  status: string;
  createdAt: string;
  imageUrl?: string;
  description?: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [score, setScore] = useState(75);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  // Read tab from URL query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'upload' || tab === 'gallery') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch reports every 5 seconds
  const fetchReports = async () => {
    try {
      const res = await fetch('/api/report');
      const data = await res.json();
      setReports(data);

      // Calculate CivicIndia Score
      const fixed = data.filter((r: Report) => r.status === 'fixed').length;
      const total = data.length || 1;
      const baseScore = 50 + (fixed / total) * 50;
      setScore(Math.round(baseScore));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle file upload
  const handleUpload = async (formData: {
    file: File
    lat: string
    lng: string
    issueType: string
  }) => {
    try {
      const data = new FormData();
      data.append('photo', formData.file);
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);
      data.append('issueType', formData.issueType);

      const res = await fetch('/api/report', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        alert('Report uploaded successfully!');
        fetchReports(); // Refresh the reports
        setActiveTab('gallery'); // Switch to gallery view to see the report
      } else {
        const error = await res.json();
        alert(`Upload failed: ${error.error}`);
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      throw error;
    }
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

  return (
    <Dashboard>
      <div className="OrganizationHomeComponent">
        <div className="OrganizationHomeComponent-in">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <StatsBar reports={reports} />

          <div className="flex-1">
            {activeTab === 'upload' && (
              <UploadTab onUpload={handleUpload} />
            )}

            {activeTab === 'gallery' && (
              <GalleryTab reports={reports} />
            )}
          </div>
        </div>
      </div>
    </Dashboard>
  );
}