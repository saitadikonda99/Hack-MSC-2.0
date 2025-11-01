'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HiHome, 
  HiUpload, 
  HiPhotograph, 
  HiChartBar, 
  HiUser,
  HiUsers,
  HiTrendingUp,
  HiHeart,
  HiCog,
  HiUserGroup
} from 'react-icons/hi';
import { HiWrenchScrewdriver } from 'react-icons/hi2';
import { PiCoin } from 'react-icons/pi';
import { usePoints } from '@/contexts/PointsContext';

import './sidebar.css'

// Icon Component using React Icons
const IconComponent = ({ icon: IconElement }: { icon: React.ComponentType<any> }) => (
  <IconElement className="sidebar-icon text-lg" />
);

// Organization Sidebar Options
const OrganizationSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'Report Issue',
    link: '/dashboard?tab=upload',
    icon: () => <IconComponent icon={HiUpload} />
  },
  {
    name: 'View Reports',
    link: '/dashboard?tab=gallery',
    icon: () => <IconComponent icon={HiPhotograph} />
  },
  {
    name: 'Civic Points',
    link: '/points',
    icon: () => <IconComponent icon={HiTrendingUp} />
  },
  {
    name: 'Analytics',
    link: '/dashboard/analytics',
    icon: () => <IconComponent icon={HiChartBar} />
  },
  {
    name: 'Profile',
    link: '/profile',
    icon: () => <IconComponent icon={HiUser} />
  }
];

// Admin Sidebar Options
const AdminSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/admin/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'All Reports',
    link: '/admin/reports',
    icon: () => <IconComponent icon={HiChartBar} />
  },
  {
    name: 'Users',
    link: '/admin/users',
    icon: () => <IconComponent icon={HiUsers} />
  },
  {
    name: 'Analytics',
    link: '/admin/analytics',
    icon: () => <IconComponent icon={HiTrendingUp} />
  },
  {
    name: 'Manage Issues',
    link: '/admin/manage',
    icon: () => <IconComponent icon={HiWrenchScrewdriver} />
  },
  {
    name: 'System Health',
    link: '/admin/health',
    icon: () => <IconComponent icon={HiHeart} />
  },
  {
    name: 'Settings',
    link: '/admin/settings',
    icon: () => <IconComponent icon={HiCog} />
  }
];

// Super Admin Sidebar Options
const SuperAdminSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/admin/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'All Reports',
    link: '/admin/reports',
    icon: () => <IconComponent icon={HiChartBar} />
  },
  {
    name: 'Users',
    link: '/admin/users',
    icon: () => <IconComponent icon={HiUsers} />
  },
  {
    name: 'Contractors',
    link: '/admin/contractors',
    icon: () => <IconComponent icon={HiUserGroup} />
  },
  {
    name: 'Analytics',
    link: '/admin/analytics',
    icon: () => <IconComponent icon={HiTrendingUp} />
  },
  {
    name: 'Manage Issues',
    link: '/admin/manage',
    icon: () => <IconComponent icon={HiWrenchScrewdriver} />
  },
  {
    name: 'System Health',
    link: '/admin/health',
    icon: () => <IconComponent icon={HiHeart} />
  },
  {
    name: 'Settings',
    link: '/admin/settings',
    icon: () => <IconComponent icon={HiCog} />
  }
];

// Contractor Sidebar Options
const ContractorSidebarOptions = [
  {
    name: 'Dashboard',
    link: '/contractor/dashboard',
    icon: () => <IconComponent icon={HiHome} />
  },
  {
    name: 'My Jobs',
    link: '/contractor/jobs',
    icon: () => <IconComponent icon={HiWrenchScrewdriver} />
  },
  {
    name: 'Profile',
    link: '/profile',
    icon: () => <IconComponent icon={HiUser} />
  }
];

const sidebar = ({ role }: { role: string }) => {
  const pathname = usePathname()
  const { totalPoints, availablePoints, loading } = usePoints()
  
  const isActiveLink = (link: string) => {
    if (link === '/dashboard' && pathname === '/dashboard') return true
    if (link !== '/dashboard' && pathname.startsWith(link)) return true
    return false
  }

  return (
    <div className="SidebarComponent">
        <div className="SidebarComponent-in">
            <div className="sidebar-header">
                <h2 className="text-lg font-semibold text-gray-700 px-4 py-2">Navigation</h2>
            </div>
            <div className="sidebar-one">
                {role === "organization" && OrganizationSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option ${isActiveLink(option.link) ? 'active' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
                {role === "admin" && AdminSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option ${isActiveLink(option.link) ? 'active' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
                {role === "super_admin" && SuperAdminSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option ${isActiveLink(option.link) ? 'active' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
                {role === "contractor" && ContractorSidebarOptions.map((option) => (
                    <div 
                        className={`sidebar-option ${isActiveLink(option.link) ? 'active' : ''}`} 
                        key={option.name}
                    >
                        <Link href={option.link}>
                            <option.icon />
                            {option.name}
                        </Link>
                    </div>
                ))}
            </div>
            <div className="sidebar-footer">
                <div className="civic-score-widget">
                    <div className="text-center p-4 bg-white border border-gray-200 rounded-lg mx-2 shadow-sm">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700 mb-2">
                            <PiCoin className="text-lg" />
                            Civic Points
                        </div>
                        {loading ? (
                            <div className="text-lg font-bold text-black">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-black">{availablePoints}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Total Earned: {totalPoints}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default sidebar