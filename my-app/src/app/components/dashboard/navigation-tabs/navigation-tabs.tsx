'use client'

import React from 'react'
import { HiUpload, HiPhotograph } from 'react-icons/hi'

interface NavigationTabsProps {
  activeTab: 'upload' | 'gallery'
  onTabChange: (tab: 'upload' | 'gallery') => void
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-white shadow-sm border border-zinc-200 mb-4 rounded-lg">
      <div className="px-4">
        <div className="flex space-x-8">
          <button
            onClick={() => onTabChange('upload')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <HiUpload className="text-base" />
            Report Issue
          </button>
          <button
            onClick={() => onTabChange('gallery')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <HiPhotograph className="text-base" />
            View Reports
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavigationTabs

