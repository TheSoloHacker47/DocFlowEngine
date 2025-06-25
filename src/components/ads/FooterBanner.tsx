'use client'

import React from 'react'
import AdSense from '../AdSense'
import { ADSENSE_CONFIG, isAdSenseEnabled } from '../../config/adsense'

const FooterBanner: React.FC = () => {
  // Only show ads in production with real AdSense account
  if (!isAdSenseEnabled()) {
    return (
      <div className="w-full bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm mt-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Advertisement Space</span>
        </div>
        <p className="mt-1 text-xs">Footer banner ad will appear here when AdSense is configured</p>
      </div>
    )
  }

  return (
    <div className="w-full mt-8">
      <AdSense
        adClient={ADSENSE_CONFIG.CLIENT_ID}
        adSlot={ADSENSE_CONFIG.AD_SLOTS.FOOTER_BANNER}
        adFormat={ADSENSE_CONFIG.AD_CONFIGS.FOOTER_BANNER.format}
        fullWidthResponsive={ADSENSE_CONFIG.AD_CONFIGS.FOOTER_BANNER.fullWidthResponsive}
        style={ADSENSE_CONFIG.AD_CONFIGS.FOOTER_BANNER.style}
        className="footer-banner-ad"
      />
    </div>
  )
}

export default FooterBanner 