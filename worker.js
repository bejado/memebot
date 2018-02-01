const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const open = require('amqplib').connect(url);
const queue = 'tasks';
const { generateVideo } = require('./video')
const { updateJob } = require('./database')
const crypto = require('crypto')

const { uploadToS3 } = require('./upload')

open.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(queue);
    ch.consume(queue, function(msg) {
      if (msg !== null) {
        const message = msg.content.toString()
        console.log('Processing message: ' + message);
        const hash = crypto.createHash('md5').update(message).digest('hex')
        const localPath = generateVideo(message, hash)
        uploadToS3(hash, localPath).then(function(url) {
          updateJob(hash, 'complete', url).then(() => {
            console.log(`Job ${hash} status set to complete`)
          })
        })
        ch.ack(msg);
      }
    });
  });
});

