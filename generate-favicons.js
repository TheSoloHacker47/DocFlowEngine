const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 150, name: 'mstile-150x150.png' }
];

async function generateFavicons() {
  try {
    // Check if sharp is installed
    console.log('📦 Checking dependencies...');
    
    // Check if SVG file exists
    const svgPath = path.join(__dirname, 'public', 'favicon.svg');
    if (!fs.existsSync(svgPath)) {
      throw new Error('favicon.svg not found in public directory');
    }
    
    console.log('🎨 Reading SVG file...');
    const svgBuffer = fs.readFileSync(svgPath);
    
    console.log('🔄 Generating PNG files...');
    
    for (const { size, name } of sizes) {
      const outputPath = path.join(__dirname, 'public', name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    console.log('\n🎉 All favicon files generated successfully!');
    console.log('\n📋 Generated files:');
    
    // List all generated files with their sizes
    for (const { name } of sizes) {
      const filePath = path.join(__dirname, 'public', name);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`   ${name} (${Math.round(stats.size / 1024)}KB)`);
      }
    }
    
    console.log('\n🔍 To verify, run: ls -la public/*.png');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
      console.error('❌ Error: Sharp package not found.');
      console.error('📦 Please install it with: npm install --save-dev sharp');
      console.error('🔄 Then run this script again: node generate-favicons.js');
    } else {
      console.error('❌ Error generating favicons:', error.message);
    }
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  console.log('🚀 DocFlowEngine Favicon Generator');
  console.log('===================================\n');
  generateFavicons();
}

module.exports = { generateFavicons }; 