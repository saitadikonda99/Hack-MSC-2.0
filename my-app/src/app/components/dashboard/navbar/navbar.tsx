import React from 'react'
import Image from 'next/image'
import { HiOfficeBuilding, HiUser } from 'react-icons/hi'

import './navbar.css'

const navbar = () => {
  return (
    <div className="DashboardNavComponent">
        <div className="DashboardNavComponent-in">
            <div className="dn-one">
                <div className="logo-container">
                    <HiOfficeBuilding className="text-2xl" />
                    <span className="logo-text">CivicIndia</span>
                </div>
            </div>
            <div className="dn-two">
                <h1>Smart City Issue Management Dashboard</h1>
            </div>
            <div className="dn-three">
                <div className="user-info">
                    <HiUser className="user-avatar text-xl" />
                    <p>Sai Tadikonda</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default navbar