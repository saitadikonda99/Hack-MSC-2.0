'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Award, CheckCircle, AlertCircle } from 'lucide-react'
import { PiCoin } from 'react-icons/pi'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card'
import { Select } from '@/app/components/ui/select'
import Dropzone from '@/app/components/ui/dropzone'
import { usePoints } from '@/contexts/PointsContext'

interface UploadTabProps {
  onUpload: (formData: {
    file: File
    lat: string
    lng: string
    issueType: string
    description?: string
  }) => Promise<void>
}

const UploadTab: React.FC<UploadTabProps> = ({ onUpload }) => {
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [issueType, setIssueType] = useState('pothole')
  const [description, setDescription] = useState('')
  const [uploadLocation, setUploadLocation] = useState({ lat: '', lng: '' })
  const [uploading, setUploading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const { totalPoints, availablePoints, loading: loadingPoints, refreshPoints } = usePoints()

  // Auto-detect location on component mount
  useEffect(() => {
    const getCurrentLocation = () => {
      setLocationStatus('loading')
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUploadLocation({
              lat: position.coords.latitude.toString(),
              lng: position.coords.longitude.toString(),
            })
            setLocationStatus('success')
          },
          (error) => {
            console.error('Error getting location:', error)
            setLocationStatus('error')
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        )
      } else {
        setLocationStatus('error')
      }
    }

    getCurrentLocation()
  }, [])

  // Handle file upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadFiles.length === 0) {
      alert('Please select a file to upload')
      return
    }
    
    if (!uploadLocation.lat || !uploadLocation.lng) {
      alert('Location detection failed. Please enable location access and try again.')
      return
    }

    setUploading(true)
    try {
      await onUpload({
        file: uploadFiles[0],
        lat: uploadLocation.lat,
        lng: uploadLocation.lng,
        issueType,
      })
      
      // Refresh points after successful upload
      await refreshPoints()
      
      // Reset form on success
      setUploadFiles([])
      setIssueType('pothole')
      
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Credit Points Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <PiCoin className="text-2xl" />
            Civic Points
          </CardTitle>
          <CardDescription>
            Earn points for reporting civic issues and help make your city better!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPoints ? (
            <div className="flex items-center justify-center">
              <div className="animate-pulse">
                <p className="text-lg text-gray-500">Loading points...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-black">{availablePoints}</p>
                <p className="text-sm text-gray-600">Available Points</p>
                <p className="text-xs text-gray-500">Total Earned: {totalPoints}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">+10-25 points per report</p>
                <p className="text-xs text-gray-600">Redeem for rewards!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Report a Civic Issue</CardTitle>
          <CardDescription>
            Upload an image of a civic issue to help improve your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Issue Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Type</label>
              <Select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="pothole">🕳️ Pothole</option>
                <option value="streetlight">💡 Street Light Defect</option>
                <option value="garbage">🗑️ Garbage/Waste Management</option>
                <option value="drainage">🌊 Drainage Issue</option>
                <option value="traffic">🚦 Traffic Signal Problem</option>
                <option value="road">🛤️ Road Maintenance</option>
                <option value="other">📝 Other</option>
              </Select>
            </div>

            {/* File Upload Dropzone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Image</label>
              <Dropzone
                onFilesChange={setUploadFiles}
                maxFiles={1}
                accept={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
                }}
              />
            </div>

            {/* Location Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                <MapPin className="h-4 w-4" />
                <div className="flex-1">
                  {locationStatus === 'loading' && (
                    <p className="text-sm text-muted-foreground">Detecting your location...</p>
                  )}
                  {locationStatus === 'success' && (
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Location detected successfully
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lat: {parseFloat(uploadLocation.lat).toFixed(4)}, 
                        Lng: {parseFloat(uploadLocation.lng).toFixed(4)}
                      </p>
                    </div>
                  )}
                  {locationStatus === 'error' && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Failed to detect location. Please enable location access.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || uploadFiles.length === 0 || locationStatus !== 'success'}
              className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  Uploading Report...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Report & Earn Points
                </>
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default UploadTab

