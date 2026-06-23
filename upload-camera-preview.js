const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dbn2ye2zo',
  api_key: '741893979265553',
  api_secret: 'oPOPe1X2hKchSnlm1E_gbBslih4'
});

async function upload() {
  try {
    const res = await cloudinary.uploader.upload('/Users/thakur/Desktop/Sample/satyadev/public/assets/camera-preview/camera-preview.png', {
      folder: 'satyadev_assets/camera-preview'
    });
    console.log(res.secure_url);
  } catch (error) {
    console.error(error);
  }
}
upload();
