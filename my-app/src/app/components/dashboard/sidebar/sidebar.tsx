'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HiHome, 
  HiMap, 
  HiUpload, 
  HiPhotograph, 
  HiChartBar, 
  HiClipboardList, 
  HiExclamation, 
  HiCog,
  HiUsers,
  HiTrendingUp,
  HiHeart
} from 'react-icons/hi';
import { HiWrenchScrewdriver } from 'react-icons/hi2';

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
    name: 'Live Map',
    link: '/dashboard?tab=map',
    icon: () => <IconComponent icon={HiMap} />
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
    name: 'My Reports',
    link: '/dashboard/my-reports',
    icon: () => <IconComponent icon={HiClipboardList} />
  },
  {
    name: 'Emergency',
    link: '/dashboard/emergency',
    icon: () => <IconComponent icon={HiExclamation} />
  },
  {
    name: 'Settings',
    link: '/dashboard/settings',
    icon: () => <IconComponent icon={HiCog} />
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

const sidebar = ({ role }: { role: string }) => {
  const pathname = usePathname()
  
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
            </div>
            <div className="sidebar-footer">
                <div className="civic-score-widget">
                    <div className="text-center p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg mx-2">
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-sm text-gray-600">Civic Score</div>
                        <div className="text-xl font-bold text-green-600">87/100</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default sidebar