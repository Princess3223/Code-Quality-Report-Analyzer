import React from 'react'
import Logo from '../../assets/images/logo.png'
import './sidebar.css'
import { Link } from 'react-router-dom'

function Sidebar() {

  return (
    <div className="sidebar">
      <div className="logo">
        <Link to={'/'}>
          <img src={Logo} alt="" />
        </Link>
      </div>
      <div className="sidebar-menu-items">
        <Link to={'/dashboard/oneCommit'} className="oneCommit common-item">
          One Commit
        </Link>
        <Link to={'/dashboard/trend'} className="trendAnalysis common-item">
          Trend Analysis
        </Link>
        <Link to={'/dashboard/hotspot'} className="hotspotAnalysis common-item">
          Hotspot Analysis
        </Link>
      </div>
    </div>
  )
}

export default Sidebar
