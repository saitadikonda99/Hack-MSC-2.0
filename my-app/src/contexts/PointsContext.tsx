'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PointsContextType {
  totalPoints: number;
  availablePoints: number;
  loading: boolean;
  refreshPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPoints = async () => {
    if (!user) {
      setTotalPoints(0);
      setAvailablePoints(0);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/points', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTotalPoints(data.user.totalPoints || 0);
        setAvailablePoints(data.user.availablePoints || 0);
      } else {
        setTotalPoints(0);
        setAvailablePoints(0);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
      setTotalPoints(0);
      setAvailablePoints(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [user]);

  const refreshPoints = async () => {
    await fetchPoints();
  };

  return (
    <PointsContext.Provider
      value={{
        totalPoints,
        availablePoints,
        loading,
        refreshPoints,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
