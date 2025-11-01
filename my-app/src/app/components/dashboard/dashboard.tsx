'use client'

import React from 'react'

import Navbar from './navbar/navbar'
import Sidebar from './sidebar/sidebar'

import './dashboard.css'

const dashboard = ({children, role = "organization"}: {children: React.ReactNode, role?: string}) => {
  return (
    <div className="DashboardComponent">
        <div className="DashboardComponent-in">
            <div className="dashboard-one">
                <Navbar />
            </div>
            <div className="dashboard-two">
                <div className="dashboard-two-one">
                    <Sidebar role={role} />
                </div>
                <div className="dashboard-two-two">
                    <div className="dashboard-two-two-in">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default dashboard