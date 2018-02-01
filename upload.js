const aws = require('aws-sdk')
const fs = require('fs')

const S3_BUCKET = process.env.S3_BUCKET

aws.config.region = 'us-west-1'

const s3 = new aws.S3()

// Upload to S3 and return a promise that will be resolved with the
// URL
function uploadToS3(key, localFileName) {
  var readStream = fs.createReadStream(localFileName);
  var params = {Bucket: S3_BUCKET, Key: key, Body: readStream};
  return s3.upload(params).promise().then(function(data) {
    console.log(`Upload to S3 successful: ${data.Location}`)
    return data.Location;
  }, function() {
    console.error(err)
  });
}

module.exports = { uploadToS3 }

