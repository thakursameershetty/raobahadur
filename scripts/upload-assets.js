const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const DIRS_TO_UPLOAD = ['layers', 'mobile-layers', 'wall-layers'];
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function main() {
  const assets = {};

  for (const dir of DIRS_TO_UPLOAD) {
    const dirPath = path.join(PUBLIC_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.') && fs.statSync(path.join(dirPath, f)).isFile());

    const camelDir = dir.replace(/-([a-z])/g, g => g[1].toUpperCase());
    assets[camelDir] = {};

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      console.log(`Uploading ${dir}/${file}...`);

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `satyadev_assets/${dir}`,
          use_filename: true,
          unique_filename: false,
          overwrite: true
        });

        console.log(`Uploaded: ${result.secure_url}`);

        const parts = result.secure_url.split('/upload/');
        const optimizedUrl = `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;

        // Strip extension for easier key usage
        const fileKey = file.split('.')[0];
        assets[camelDir][fileKey] = optimizedUrl;
      } catch (err) {
        console.error(`Failed to upload ${filePath}`, err);
      }
    }
  }

  const jsContent = `export const ASSETS = ${JSON.stringify(assets, null, 2)};\n`;
  const libDir = path.join(process.cwd(), 'src', 'lib');
  if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
  fs.writeFileSync(path.join(libDir, 'assets.js'), jsContent);
  console.log('Successfully generated src/lib/assets.js');
}

main().catch(console.error);
