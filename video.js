const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const tempDirectory = 'generated'

// Create the temporary directory
if (!fs.existsSync(tempDirectory)){
    fs.mkdirSync(tempDirectory);
}

function generateVideo(youtubeLink, id) {
  return new Promise((resolve, reject) => {
    const finalPath = path.join('generated', id + '.mp4')
    const process = spawn('ffmpeg_testing/test_script.sh', [id, youtubeLink], { stdio: 'inherit' })
    process.on('exit', () => {
      resolve(finalPath)
    })
  })
}

// function generateVideo(contents, name) {
//   const finalPath = path.join('generated', name)
//   fs.writeFileSync(finalPath, contents);
//   return finalPath;
// }

module.exports = { generateVideo }

