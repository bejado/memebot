const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const open = require('amqplib').connect(url);
const queue = 'tasks';

open.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(queue);
    ch.consume(queue, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  });
});

