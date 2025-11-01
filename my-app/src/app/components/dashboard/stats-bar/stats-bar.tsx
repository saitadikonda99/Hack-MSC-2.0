'use client'

import React from 'react'
import { usePoints } from '@/contexts/PointsContext'
import { PiCoin } from 'react-icons/pi'

interface Report {
  status: string
}

interface StatsBarProps {
  reports: Report[]
}

const StatsBar: React.FC<StatsBarProps> = ({ reports }) => {
  const { totalPoints, availablePoints, loading } = usePoints()
  
  return (
    <div className="bg-white shadow-sm border border-zinc-200 p-4 mb-4 rounded-lg">
      <div className="grid grid-cols-5 gap-4 text-center">
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">
            {reports.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-zinc-600">Pending</div>
        </div>
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">
            {reports.filter(r => r.status === 'assigned' || r.status === 'in_progress').length}
          </div>
          <div className="text-sm text-zinc-600">In Progress</div>
        </div>
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">
            {reports.filter(r => r.status === 'fixed' || r.status === 'resolved').length}
          </div>
          <div className="text-sm text-zinc-600">Resolved</div>
        </div>
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">{reports.length}</div>
          <div className="text-sm text-zinc-600">Total Reports</div>
        </div>
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-black">
            {loading ? '...' : availablePoints}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-zinc-600">
            <PiCoin className="text-base" />
            Civic Points
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsBar

