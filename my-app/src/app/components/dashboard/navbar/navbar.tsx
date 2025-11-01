'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import { HiOfficeBuilding, HiUser, HiLogout, HiChevronDown } from 'react-icons/hi'
import { useAuth } from '@/contexts/AuthContext'

import './navbar.css'

const navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="DashboardNavComponent">
        <div className="DashboardNavComponent-in">
            <div className="dn-one">
                <div className="logo-container">
                    <HiOfficeBuilding className="text-2xl" />
                    <span className="logo-text">CivicIndia</span>
                </div>
            </div>
            <div className="dn-two">
                <h1>Smart City Issue Management Dashboard</h1>
            </div>
            <div className="dn-three">
                <div className="user-info" style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#71717a'
                        }}
                    >
                        <HiUser className="user-avatar text-xl" />
                        <p>{user?.name || 'User'}</p>
                        <HiChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e4e4e7',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            minWidth: '150px',
                            zIndex: 10,
                            marginTop: '0.5rem'
                        }}>
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid #e4e4e7',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                {user?.email}
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#dc2626',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <HiLogout />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default navbar