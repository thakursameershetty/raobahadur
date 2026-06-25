const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: 'dbn2ye2zo',
  api_key: '741893979265553',
  api_secret: 'oPOPe1X2hKchSnlm1E_gbBslih4'
});

const assets = [
  { file: 'background.png',  key: 'background'  },
  { file: 'leftwing.png',    key: 'leftwing'    },
  { file: 'rightwing.png',   key: 'rightwing'   },
  { file: 'wings.png',       key: 'wings'       },
];

const BASE = path.join(__dirname, 'public');

async function upload() {
  const results = {};
  for (const { file, key } of assets) {
    const filePath = path.join(BASE, file);
    try {
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 'satyadev_assets/photobooth',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: 'image',
      });
      results[key] = res.secure_url;
      console.log('DONE ' + key + ': ' + res.secure_url);
    } catch (err) {
      console.error('FAIL ' + key + ': ' + err.message);
    }
  }
  console.log('\nASSET_MAP:' + JSON.stringify(results));
}

upload();
