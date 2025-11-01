'use client'

import React from 'react'

interface Report {
  id: number
  lat: number
  lng: number
  issueType: string
  severity: number
  status: string
  createdAt: string
  imageUrl?: string
}

interface GalleryTabProps {
  reports: Report[]
}

const GalleryTab: React.FC<GalleryTabProps> = ({ reports }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Issue Reports Gallery</h2>
      
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📂</div>
          <p className="text-gray-600">No reports uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {report.imageUrl && (
                <img
                  src={report.imageUrl}
                  alt={`${report.issueType} report`}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg capitalize">{report.issueType}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'pending' ? 'bg-red-100 text-red-800' :
                    report.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Severity: {report.severity}/10
                </p>
                <p className="text-gray-500 text-xs">
                  Location: {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                </p>
                <p className="text-gray-500 text-xs">
                  Reported: {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GalleryTab

