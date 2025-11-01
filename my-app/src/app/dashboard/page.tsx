// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Dashboard from '@/app/components/dashboard/dashboard';
import NavigationTabs from '@/app/components/dashboard/navigation-tabs/navigation-tabs';
import StatsBar from '@/app/components/dashboard/stats-bar/stats-bar';
import MapTab from '@/app/components/dashboard/map-tab/map-tab';
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
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [score, setScore] = useState(75);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'upload' | 'gallery'>('map');

  // Read tab from URL query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'map' || tab === 'upload' || tab === 'gallery') {
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
        setActiveTab('map'); // Switch back to map view
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

  return (
    <Dashboard>
      <div className="OrganizationHomeComponent">
        <div className="OrganizationHomeComponent-in">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <StatsBar reports={reports} />

          <div className="flex-1">
            {activeTab === 'map' && (
              <MapTab
                reports={reports}
                loading={loading}
                score={score}
                mapLoaded={mapLoaded}
                onMapLoad={() => setMapLoaded(true)}
              />
            )}

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