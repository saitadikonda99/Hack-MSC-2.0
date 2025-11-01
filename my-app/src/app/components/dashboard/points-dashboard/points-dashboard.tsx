'use client'

import React, { useState, useEffect } from 'react'
import { Award, Clock, Gift, TrendingUp, History, Copy, Check } from 'lucide-react'
import { usePoints } from '@/contexts/PointsContext'

interface PointTransaction {
  id: number
  type: 'earned' | 'redeemed'
  amount: number
  description: string
  reportId?: number
  createdAt: string
}

interface UserPoints {
  id: number
  name: string
  email: string
  totalPoints: number
  availablePoints: number
}

interface PointsData {
  user: UserPoints
  history: PointTransaction[]
}

interface Coupon {
  id: number
  brand: string
  couponCode: string
  value: number
  pointsCost: number
  status: string
  redeemedAt: string
  usedAt?: string
  expiresAt: string
}

interface CouponOption {
  brand: string
  name: string
  pointsCost: number
  value: number
  emoji: string
}

const PointsDashboard = () => {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemAmount, setRedeemAmount] = useState('')
  const [redeemDescription, setRedeemDescription] = useState('')
  const [showRedemption, setShowRedemption] = useState(false)
  const { refreshPoints } = usePoints()

  const fetchPointsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/points', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPointsData(data)
      } else {
        console.error('Failed to fetch points data')
      }
    } catch (error) {
      console.error('Error fetching points:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPointsData()
  }, [])

  const handleRedemption = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseInt(redeemAmount)
    if (!amount || amount <= 0 || !redeemDescription.trim()) {
      alert('Please enter valid amount and description')
      return
    }

    if (!pointsData || amount > pointsData.user.availablePoints) {
      alert('Insufficient points')
      return
    }

    try {
      setRedeeming(true)
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: amount,
          description: redeemDescription
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully redeemed ${amount} points! New balance: ${result.newBalance}`)
        setRedeemAmount('')
        setRedeemDescription('')
        setShowRedemption(false)
        await fetchPointsData() // Refresh data
        await refreshPoints() // Refresh points in context for sidebar
      } else {
        const error = await response.json()
        alert(`Redemption failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Redemption error:', error)
      alert('Network error. Please try again.')
    } finally {
      setRedeeming(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const redemptionOptions = [
    { points: 100, item: 'Coffee Voucher', description: '₹50 coffee shop voucher' },
    { points: 250, item: 'Bus Pass Credit', description: '₹100 public transport credit' },
    { points: 500, item: 'Food Delivery Voucher', description: '₹200 food delivery discount' },
    { points: 1000, item: 'Shopping Voucher', description: '₹400 shopping mall voucher' },
    { points: 2000, item: 'Movie Tickets', description: 'Two movie tickets for any theater' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!pointsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load points data</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Award className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-green-600">{pointsData.user.availablePoints}</h3>
          <p className="text-gray-600">Available Points</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-blue-600">{pointsData.user.totalPoints}</h3>
          <p className="text-gray-600">Total Earned</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Gift className="h-12 w-12 text-purple-500 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-purple-600">{pointsData.user.totalPoints - pointsData.user.availablePoints}</h3>
          <p className="text-gray-600">Points Redeemed</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Redemption Options */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            Redeem Points
          </h2>
          
          {!showRedemption ? (
            <div className="space-y-3">
              {redemptionOptions.map((option, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-lg ${
                    pointsData.user.availablePoints >= option.points 
                      ? 'border-green-200 bg-green-50 cursor-pointer hover:bg-green-100' 
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                  onClick={() => {
                    if (pointsData.user.availablePoints >= option.points) {
                      setRedeemAmount(option.points.toString())
                      setRedeemDescription(option.item)
                      setShowRedemption(true)
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{option.item}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{option.points} pts</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setShowRedemption(true)}
                className="w-full mt-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Custom Redemption
              </button>
            </div>
          ) : (
            <form onSubmit={handleRedemption} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Points to Redeem</label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter points amount"
                  min="1"
                  max={pointsData.user.availablePoints}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={redeemDescription}
                  onChange={(e) => setRedeemDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="What are you redeeming for?"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={redeeming}
                  className="flex-1 bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {redeeming ? 'Processing...' : 'Redeem Points'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRedemption(false)
                    setRedeemAmount('')
                    setRedeemDescription('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            Recent Activity
          </h2>
          
          {pointsData.history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pointsData.history.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border-l-4 border-gray-100 bg-gray-50 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    {transaction.type === 'earned' ? (
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Gift className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right font-bold ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PointsDashboard