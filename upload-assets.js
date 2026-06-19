const cloudinary = require('cloudinary').v2;
const path = require('path');

// Extract from URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
cloudinary.config({
  cloud_name: 'dbn2ye2zo',
  api_key: '741893979265553',
  api_secret: 'oPOPe1X2hKchSnlm1E_gbBslih4'
});

const assetsToUpload = [
  '/Users/thakur/Desktop/Sample/satyadev/public/assets/extras/peacock-feather.png',
  '/Users/thakur/Desktop/Sample/satyadev/public/assets/extras/spooky-pumpkin.png',
  '/Users/thakur/Desktop/Sample/satyadev/public/assets/camera-preview/camera-preview.png'
];

async function uploadAssets() {
  for (const assetPath of assetsToUpload) {
    try {
      const result = await cloudinary.uploader.upload(assetPath, {
        folder: 'satyadev_assets/extras'
      });
      console.log(`Uploaded ${path.basename(assetPath)}:`);
      console.log(result.secure_url);
    } catch (error) {
      console.error(`Error uploading ${path.basename(assetPath)}:`, error);
    }
  }
}

uploadAssets();
