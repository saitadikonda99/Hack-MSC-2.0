'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { HiLocationMarker, HiCheckCircle, HiClock, HiExclamation } from 'react-icons/hi';
import './page.css';

interface Job {
  id: number;
  lat: number;
  lng: number;
  imageUrl: string;
  issueType: string;
  severity: number;
  description: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  distance: number; // Distance in km
  userId: number;
  userName: string;
}

interface ContractorLocation {
  latitude: number;
  longitude: number;
}

export default function ContractorJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contractorLocation, setContractorLocation] = useState<ContractorLocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'contractor')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'contractor') {
      fetchJobs();
    }
  }, [user, filterStatus]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/contractor/jobs?status=${filterStatus}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        setContractorLocation(data.contractorLocation);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId: number) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/contractor/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Job accepted successfully!');
        fetchJobs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to accept job');
      }
    } catch (err) {
      setError('Failed to accept job');
      console.error(err);
    }
  };

  const handleCompleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to mark this job as completed?')) return;

    try {
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/contractor/jobs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Job marked as completed!');
        fetchJobs();
        setShowDetailsModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to complete job');
      }
    } catch (err) {
      setError('Failed to complete job');
      console.error(err);
    }
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
    setError('');
    setSuccess('');
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 0.7) return 'high';
    if (severity >= 0.4) return 'medium';
    return 'low';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending"><HiClock /> Pending</span>;
      case 'in_progress':
        return <span className="status-badge status-progress"><HiExclamation /> In Progress</span>;
      case 'resolved':
        return <span className="status-badge status-resolved"><HiCheckCircle /> Resolved</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const filteredJobs = jobs;

  if (authLoading || (user && user.role !== 'contractor')) {
    return null;
  }

  const jobsContent = (
    <div className="contractor-jobs-page">
      <div className="jobs-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Available Jobs</h1>
          <p className="text-gray-600 mt-2">
            Problems within 50km of your location
            {contractorLocation && (
              <span className="ml-2">
                <HiLocationMarker className="inline" /> 
                ({contractorLocation.latitude.toFixed(4)}, {contractorLocation.longitude.toFixed(4)})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Jobs
        </button>
        <button
          className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Available
        </button>
        <button
          className={`filter-tab ${filterStatus === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilterStatus('in_progress')}
        >
          My Jobs
        </button>
        <button
          className={`filter-tab ${filterStatus === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilterStatus('resolved')}
        >
          Completed
        </button>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Jobs Grid */}
      <div className="jobs-container">
        {loading ? (
          <div className="loading-state">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <HiLocationMarker className="empty-icon" />
            <p>No jobs found within 50km of your location</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-image">
                  <img src={job.imageUrl} alt={job.issueType} />
                  <div className={`severity-badge severity-${getSeverityColor(job.severity)}`}>
                    Severity: {(job.severity * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="job-content">
                  <div className="job-header">
                    <h3 className="job-title">
                      {job.issueType.charAt(0).toUpperCase() + job.issueType.slice(1).replace('_', ' ')}
                    </h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <p className="job-description">
                    {job.description || 'No description provided'}
                  </p>
                  <div className="job-meta">
                    <div className="meta-item">
                      <HiLocationMarker className="meta-icon" />
                      <span>{job.distance.toFixed(2)} km away</span>
                    </div>
                    <div className="meta-item">
                      <HiClock className="meta-icon" />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="job-actions">
                    <button
                      onClick={() => openJobDetails(job)}
                      className="btn-view"
                    >
                      View Details
                    </button>
                    {job.status === 'pending' && !job.assignedTo && (
                      <button
                        onClick={() => handleAcceptJob(job.id)}
                        className="btn-accept"
                      >
                        Accept Job
                      </button>
                    )}
                    {job.status === 'in_progress' && job.assignedTo === user?.email && (
                      <button
                        onClick={() => handleCompleteJob(job.id)}
                        className="btn-complete"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content job-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Job Details</h2>
            <div className="job-details">
              <div className="detail-image">
                <img src={selectedJob.imageUrl} alt={selectedJob.issueType} />
              </div>
              <div className="detail-info">
                <div className="detail-row">
                  <span className="detail-label">Issue Type:</span>
                  <span className="detail-value">
                    {selectedJob.issueType.charAt(0).toUpperCase() + 
                     selectedJob.issueType.slice(1).replace('_', ' ')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  {getStatusBadge(selectedJob.status)}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Severity:</span>
                  <span className={`severity-text severity-${getSeverityColor(selectedJob.severity)}`}>
                    {(selectedJob.severity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Distance:</span>
                  <span className="detail-value">{selectedJob.distance.toFixed(2)} km</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {selectedJob.lat.toFixed(6)}, {selectedJob.lng.toFixed(6)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reported By:</span>
                  <span className="detail-value">{selectedJob.userName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reported On:</span>
                  <span className="detail-value">
                    {new Date(selectedJob.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedJob.description && (
                  <div className="detail-row full-width">
                    <span className="detail-label">Description:</span>
                    <p className="detail-description">{selectedJob.description}</p>
                  </div>
                )}
                {selectedJob.assignedTo && (
                  <div className="detail-row">
                    <span className="detail-label">Assigned To:</span>
                    <span className="detail-value">{selectedJob.assignedTo}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDetailsModal(false)} className="cancel-btn">
                Close
              </button>
              {selectedJob.status === 'pending' && !selectedJob.assignedTo && (
                <button
                  onClick={() => {
                    handleAcceptJob(selectedJob.id);
                    setShowDetailsModal(false);
                  }}
                  className="submit-btn"
                >
                  Accept Job
                </button>
              )}
              {selectedJob.status === 'in_progress' && selectedJob.assignedTo === user?.email && (
                <button
                  onClick={() => handleCompleteJob(selectedJob.id)}
                  className="submit-btn btn-complete"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <Dashboard role={user?.role || 'contractor'}>{jobsContent}</Dashboard>;
}
