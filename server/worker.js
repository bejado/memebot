const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const open = require('amqplib').connect(url);
const { processJob } = require('./job_processing');

const queue = 'tasks';

open.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(queue);
    ch.consume(queue, function(msg) {
      if (msg !== null) {
        const message = msg.content.toString();
        console.log('Processing message: ' + message);
        processJob(message);
        ch.ack(msg);
      }
    });
  });
});
