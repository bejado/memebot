const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

const tempDirectory = 'generated';
const timeoutLength = 1 * 60 * 1000; // 1 minute

// Create the temporary directory
if (!fs.existsSync(tempDirectory)) {
  fs.mkdirSync(tempDirectory);
}

function generateVideo(youtubeLink, id) {
  return new Promise((resolve, reject) => {
    const finalPath = path.join('generated', id + '.mp4');
    const startTime = url.parse(youtubeLink, true).query.t || 0;
    const child = spawn(
      'video_scripts/generate_video.sh',
      [id, youtubeLink, startTime],
      {
        stdio: 'inherit',
        detached: true
      }
    );
    let hasExited = false;
    child.on('exit', code => {
      hasExited = true;
      if (code == 0) {
        // success
        resolve(finalPath);
      } else {
        reject({ error: 'The video generation script failed.' });
      }
    });
    setTimeout(() => {
      if (!hasExited) {
        console.log('Timeout exceeded, killing child');
        // Kill child and all subprocesses (like youtube-dl, ffmpeg, etc)
        process.kill(-child.pid);
        reject({ error: 'Server time exceeded. Try a shorter video.' });
      }
    }, timeoutLength);
  });
}

module.exports = { generateVideo };
