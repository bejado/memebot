const fs = require('fs')
const path = require('path')

const tempDirectory = 'generated'

// Create the temporary directory
if (!fs.existsSync(tempDirectory)){
    fs.mkdirSync(tempDirectory);
}

function generateVideo(contents, name) {
  const finalPath = path.join('generated', name)
  fs.writeFileSync(finalPath, contents);
  return finalPath;
}

module.exports = { generateVideo }

