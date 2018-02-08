const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

const tempDirectory = 'generated';

// Create the temporary directory
if (!fs.existsSync(tempDirectory)) {
  fs.mkdirSync(tempDirectory);
}

function generateVideo(youtubeLink, id) {
  return new Promise((resolve, reject) => {
    const finalPath = path.join('generated', id + '.mp4');
    const startTime = url.parse(youtubeLink, true).query.t || 0;
    const process = spawn(
      'video_scripts/generate_video.sh',
      [id, youtubeLink, startTime],
      { stdio: 'inherit' }
    );
    process.on('exit', code => {
      if (code == 0) {
        // success
        resolve(finalPath);
      } else {
        reject({ error: 'The video generation script failed.' });
      }
    });
  });
}

module.exports = { generateVideo };
