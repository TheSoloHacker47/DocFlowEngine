# Google AdSense Setup Guide for DocFlowEngine

This guide walks you through the complete process of setting up Google AdSense for the DocFlowEngine PDF to Word converter application.

## Prerequisites

Before applying for AdSense, ensure your website meets these requirements:

### ✅ Technical Requirements
- [x] **Complete Website**: All pages are functional and content-rich
- [x] **Privacy Policy**: Available at `/privacy-policy`
- [x] **Terms of Service**: Available at `/terms-of-service`
- [x] **Contact Page**: Available at `/contact`
- [x] **About Page**: Available at `/about`
- [x] **Mobile-Responsive Design**: Works on all devices
- [x] **HTTPS Enabled**: Secure connection (handled by Vercel)
- [x] **Fast Loading**: Optimized performance

### ✅ Content Requirements
- [x] **Original Content**: Unique, valuable content for users
- [x] **Professional Design**: Clean, modern interface
- [x] **User-Friendly Navigation**: Clear site structure
- [x] **Regular Updates**: Active development and maintenance

## Step 1: Deploy to Production

Before applying for AdSense, deploy your application to a production URL:

1. **Deploy to Vercel** (if not already done):
   ```bash
   # Connect to Vercel
   npx vercel --prod
   
   # Or deploy via GitHub integration
   # Push to main branch for automatic deployment
   ```

2. **Verify Production URL**: 
   - Your site should be accessible at `https://your-domain.vercel.app`
   - All pages should load correctly
   - Test the PDF conversion functionality

## Step 2: Create Google AdSense Account

1. **Visit Google AdSense**: Go to https://www.google.com/adsense/

2. **Sign Up Process**:
   - Click "Get started"
   - Use your Google account (create one if needed)
   - Select your country/region
   - Choose "I want to monetize a website"

3. **Add Your Website**:
   - Enter your production URL: `https://your-domain.vercel.app`
   - Select your country/region
   - Choose your payment currency

4. **Connect Your Site to AdSense**:
   - AdSense will provide an HTML code snippet
   - **IMPORTANT**: You don't need to manually add this - our app is already configured!
   - The code will look like: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>`

## Step 3: Configure Environment Variables

Once you have your AdSense client ID:

1. **Update Vercel Environment Variables**:
   ```bash
   # In your Vercel dashboard, add these environment variables:
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   NEXT_PUBLIC_ADSENSE_HEADER_SLOT=1234567890
   NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=1234567891
   NEXT_PUBLIC_ADSENSE_FOOTER_SLOT=1234567892
   ```

2. **Local Development** (create `.env.local`):
   ```bash
   # For local testing (optional)
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   NEXT_PUBLIC_ADSENSE_HEADER_SLOT=1234567890
   NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=1234567891
   NEXT_PUBLIC_ADSENSE_FOOTER_SLOT=1234567892
   ```

## Step 4: Create Ad Units

After your site is approved (this can take 1-7 days):

1. **Access AdSense Dashboard**:
   - Go to https://www.google.com/adsense/
   - Navigate to "Ads" → "By ad unit"

2. **Create Ad Units**:
   
   **Header Banner Ad**:
   - Click "Create ad unit"
   - Choose "Display ads"
   - Name: "Header Banner"
   - Size: "Responsive"
   - Copy the ad slot ID and update `NEXT_PUBLIC_ADSENSE_HEADER_SLOT`

   **Sidebar Ad**:
   - Create another ad unit
   - Name: "Sidebar"
   - Size: "Responsive" 
   - Copy the ad slot ID and update `NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT`

   **Footer Banner Ad**:
   - Create another ad unit
   - Name: "Footer Banner"
   - Size: "Responsive"
   - Copy the ad slot ID and update `NEXT_PUBLIC_ADSENSE_FOOTER_SLOT`

## Step 5: Update Configuration

1. **Update Environment Variables** with real ad slot IDs:
   ```bash
   # Replace placeholder values with real ad slot IDs from AdSense
   NEXT_PUBLIC_ADSENSE_HEADER_SLOT=your-actual-header-slot-id
   NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=your-actual-sidebar-slot-id
   NEXT_PUBLIC_ADSENSE_FOOTER_SLOT=your-actual-footer-slot-id
   ```

2. **Redeploy Application**:
   ```bash
   # Trigger a new deployment to apply the environment variables
   git commit -m "Update AdSense configuration with real ad slot IDs"
   git push origin main
   ```

## Step 6: Verify Ad Display

1. **Check Ad Placement**:
   - Visit your production site
   - Verify ads appear in the header, sidebar, and footer
   - Test on both desktop and mobile devices

2. **Monitor Performance**:
   - Check AdSense dashboard for impressions and clicks
   - Monitor site performance to ensure ads don't slow down the site

## Troubleshooting

### Common Issues:

**Ads Not Showing**:
- Verify environment variables are set correctly in Vercel
- Check that ad slot IDs match those in AdSense dashboard
- Ensure site is approved and ads are active

**Approval Delays**:
- Ensure all required pages have substantial content
- Check that your privacy policy mentions AdSense/cookies
- Verify site is fully functional and professional

**Performance Issues**:
- Our implementation loads ads asynchronously
- Ads only load in production (not in development)
- Monitor Core Web Vitals in Google Search Console

### Support Resources:

- **AdSense Help Center**: https://support.google.com/adsense/
- **AdSense Policies**: https://support.google.com/adsense/answer/48182
- **Site Quality Guidelines**: https://support.google.com/adsense/answer/9335564

## Implementation Details

Our AdSense integration includes:

- **Environment-Aware Loading**: Ads only load in production
- **Responsive Design**: Ads adapt to different screen sizes
- **Performance Optimized**: Async loading with proper error handling
- **Development Placeholders**: Clear visual indicators during development
- **TypeScript Support**: Fully typed implementation

The technical implementation is complete and ready for your AdSense account setup! 