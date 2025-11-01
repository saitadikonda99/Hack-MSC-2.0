'use client'

import React from 'react'

interface Report {
  status: string
}

interface StatsBarProps {
  reports: Report[]
}

const StatsBar: React.FC<StatsBarProps> = ({ reports }) => {
  return (
    <div className="bg-white shadow-sm border border-zinc-200 p-4 mb-4 rounded-lg">
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">
            {reports.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-zinc-600">Pending</div>
        </div>
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">
            {reports.filter(r => r.status === 'assigned').length}
          </div>
          <div className="text-sm text-zinc-600">In Progress</div>
        </div>
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">
            {reports.filter(r => r.status === 'fixed').length}
          </div>
          <div className="text-sm text-zinc-600">Resolved</div>
        </div>
        <div className="p-3 rounded-lg border border-zinc-100">
          <div className="text-2xl font-bold text-zinc-900">{reports.length}</div>
          <div className="text-sm text-zinc-600">Total Reports</div>
        </div>
      </div>
    </div>
  )
}

export default StatsBar

