'use client'

import React from 'react'
import AdSense from '../AdSense'
import { ADSENSE_CONFIG, isAdSenseEnabled } from '../../config/adsense'

const SidebarAd: React.FC = () => {
  // Only show ads in production with real AdSense account
  if (!isAdSenseEnabled()) {
    return (
      <div className="hidden lg:block w-72 bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Advertisement</span>
        </div>
        <div className="h-96 bg-gray-200 rounded flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
            <p className="text-xs">Sidebar ad will appear here</p>
            <p className="text-xs">when AdSense is configured</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:block w-72">
      <div className="sticky top-4">
        <AdSense
          adClient={ADSENSE_CONFIG.CLIENT_ID}
          adSlot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR}
          adFormat={ADSENSE_CONFIG.AD_CONFIGS.SIDEBAR.format}
          fullWidthResponsive={ADSENSE_CONFIG.AD_CONFIGS.SIDEBAR.fullWidthResponsive}
          style={ADSENSE_CONFIG.AD_CONFIGS.SIDEBAR.style}
          className="sidebar-ad"
        />
      </div>
    </div>
  )
}

export default SidebarAd 