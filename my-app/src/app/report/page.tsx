'use client';

import { useState } from 'react';

// Helper to get current location as a Promise
function getCurrentLocation(): Promise<{ lat: string; lng: string }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      return reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  });
}

export default function ReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  const fetchLocation = async () => {
    setError(null);
    setLocLoading(true);
    try {
      const pos = await getCurrentLocation();
      setLat(pos.lat);
      setLng(pos.lng);
    } catch (err: any) {
      setError(err?.message || 'Failed to get location');
    } finally {
      setLocLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please choose an image file');
      return;
    }

    setLoading(true);

    // If lat/lng not set yet, try to fetch automatically
    if (!lat || !lng) {
      try {
        const pos = await getCurrentLocation();
        setLat(pos.lat);
        setLng(pos.lng);
      } catch (err: any) {
        // If automatic location fails, show error and allow manual fallback
        setLoading(false);
        setError('Could not get current location. Allow location access or enter coordinates manually.');
        setManual(true);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('lat', lat);
      formData.append('lng', lng);

      const res = await fetch('/api/report', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        setError(data?.error || 'Server error');
      } else {
        // optionally reset form on success
        setFile(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Report Issue</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchLocation}
            className="bg-gray-200 px-3 py-1 rounded"
            disabled={locLoading}
          >
            {locLoading ? 'Fetching location...' : 'Use current location'}
          </button>

          <button
            type="button"
            onClick={() => setManual((m) => !m)}
            className="text-sm underline"
          >
            {manual ? 'Hide manual entry' : 'Enter coordinates manually'}
          </button>
        </div>

        {lat && lng && (
          <div className="text-sm text-gray-700">
            Using location: {lat}, {lng}
          </div>
        )}

        {manual && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="border p-2"
              required
            />
            <input
              type="text"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="border p-2"
              required
            />
          </div>
        )}

        {error && <div className="text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Analyzing...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}