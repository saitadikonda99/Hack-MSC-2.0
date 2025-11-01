'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiFilter } from 'react-icons/hi';
import './page.css';

interface Contractor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  company?: string;
  status: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  available: number;
  suspended: number;
}

export default function ContractorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, available: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [gettingLocation, setGettingLocation] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    latitude: '',
    longitude: '',
    status: 'active',
    isAvailable: true,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'super_admin' && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      fetchContractors();
    }
  }, [user]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setGettingLocation(false);
        setSuccess('Location captured successfully!');
        setTimeout(() => setSuccess(''), 3000);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enter manually.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contractors');
      const data = await response.json();

      if (response.ok) {
        setContractors(data.contractors);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch contractors');
      }
    } catch (err) {
      setError('Failed to fetch contractors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contractor added successfully!');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          latitude: '',
          longitude: '',
          status: 'active',
          isAvailable: true,
        });
        fetchContractors();
      } else {
        setError(data.error || 'Failed to add contractor');
      }
    } catch (err) {
      setError('Failed to add contractor');
      console.error(err);
    }
  };

  const handleEditContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedContractor) return;

    try {
      const response = await fetch('/api/admin/contractors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedContractor.id, ...formData }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contractor updated successfully!');
        setShowEditModal(false);
        setSelectedContractor(null);
        fetchContractors();
      } else {
        setError(data.error || 'Failed to update contractor');
      }
    } catch (err) {
      setError('Failed to update contractor');
      console.error(err);
    }
  };

  const handleDeleteContractor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contractor?')) return;

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/contractors?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contractor deleted successfully!');
        fetchContractors();
      } else {
        setError(data.error || 'Failed to delete contractor');
      }
    } catch (err) {
      setError('Failed to delete contractor');
      console.error(err);
    }
  };

  const openEditModal = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setFormData({
      name: contractor.name,
      email: contractor.email,
      phone: contractor.phone,
      latitude: contractor.latitude?.toString() || '',
      longitude: contractor.longitude?.toString() || '',
      status: contractor.status,
      isAvailable: contractor.isAvailable,
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || contractor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || (user && user.role !== 'super_admin' && user.role !== 'admin')) {
    return null;
  }

  const contractorContent = (
    <div className="contractors-page">
      <div className="contractors-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contractor Management</h1>
          <p className="text-gray-600 mt-2">Manage contractors and assign them to civic issues</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setError('');
            setSuccess('');
          }}
          className="add-contractor-btn"
        >
          <HiPlus className="mr-2" />
          Add Contractor
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Contractors</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value text-green-600">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available</div>
          <div className="stat-value text-blue-600">{stats.available}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suspended</div>
          <div className="stat-value text-red-600">{stats.suspended}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <HiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <HiFilter className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Contractors Table */}
      <div className="contractors-table-container">
        {loading ? (
          <div className="loading-state">Loading contractors...</div>
        ) : filteredContractors.length === 0 ? (
          <div className="empty-state">No contractors found</div>
        ) : (
          <table className="contractors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Jobs</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id}>
                  <td className="font-medium">{contractor.name}</td>
                  <td>{contractor.email}</td>
                  <td>{contractor.phone}</td>
                  <td>{contractor.company || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${contractor.status}`}>
                      {contractor.status}
                    </span>
                  </td>
                  <td>
                    <div className="rating">
                      ⭐ {contractor.rating?.toFixed(1) || '0.0'}
                    </div>
                  </td>
                  <td>
                    {contractor.completedJobs}/{contractor.totalJobs}
                  </td>
                  <td>
                    <span className={`availability-badge ${contractor.isAvailable ? 'available' : 'unavailable'}`}>
                      {contractor.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(contractor)}
                        className="edit-btn"
                        title="Edit"
                      >
                        <HiPencil />
                      </button>
                      <button
                        onClick={() => handleDeleteContractor(contractor.id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Contractor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add New Contractor</h2>
            <form onSubmit={handleAddContractor}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Location Coordinates</label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="get-location-btn"
                  >
                    {gettingLocation ? '📍 Getting Location...' : '📍 Get Current Location'}
                  </button>
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., -74.0060"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    Available for work
                  </label>
                </div>
              </div>
              {error && <div className="error-message mt-4">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contractor Modal */}
      {showEditModal && selectedContractor && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Contractor</h2>
            <form onSubmit={handleEditContractor}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Location Coordinates</label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="get-location-btn"
                  >
                    {gettingLocation ? '📍 Getting Location...' : '📍 Get Current Location'}
                  </button>
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., -74.0060"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    Available for work
                  </label>
                </div>
              </div>
              {error && <div className="error-message mt-4">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return <Dashboard role={user?.role || 'user'}>{contractorContent}</Dashboard>;
}
