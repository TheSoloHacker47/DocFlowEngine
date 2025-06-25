// AdSense Configuration
// Update these values when your AdSense account is approved

export const ADSENSE_CONFIG = {
  // Replace with your actual AdSense client ID when approved
  CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Ad slot IDs - these will be generated when you create ad units
  AD_SLOTS: {
    HEADER_BANNER: process.env.NEXT_PUBLIC_ADSENSE_HEADER_SLOT || '1234567890',
    SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '1234567891',
    FOOTER_BANNER: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '1234567892',
    IN_ARTICLE: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT || '1234567893'
  },
  
  // Ad configurations
  AD_CONFIGS: {
    HEADER_BANNER: {
      format: 'auto',
      fullWidthResponsive: true,
      style: { width: '100%', height: '90px' }
    },
    SIDEBAR: {
      format: 'auto',
      fullWidthResponsive: true,
      style: { width: '300px', height: '600px' }
    },
    FOOTER_BANNER: {
      format: 'auto',
      fullWidthResponsive: true,
      style: { width: '100%', height: '90px' }
    },
    IN_ARTICLE: {
      format: 'fluid',
      fullWidthResponsive: true,
      style: { width: '100%', height: '280px' }
    }
  }
}

// AdSense script URL
export const ADSENSE_SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'

// Check if AdSense is enabled (in production with real client ID)
export const isAdSenseEnabled = () => {
  return process.env.NODE_ENV === 'production' && 
         ADSENSE_CONFIG.CLIENT_ID !== 'ca-pub-XXXXXXXXXXXXXXXX'
} 