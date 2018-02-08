const { generateVideo } = require('./video');
const { updateJob } = require('./database');
const crypto = require('crypto');
const { uploadToS3 } = require('./upload');

const processJob = message => {
  const hash = crypto
    .createHash('md5')
    .update(message)
    .digest('hex');
  return generateVideo(message, hash).then(localPath => {
    uploadToS3(hash + '.mp4', localPath).then(
      function(url) {
        updateJob(hash, 'complete', url).then(() => {
          console.log(`Job ${hash} status set to complete`);
        });
      },
      function(err) {
        console.error(err);
        console.error('Error uploading to S3');
      }
    );
  });
};

module.exports = { processJob };
