const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const open = require('amqplib').connect(url);
const queue = 'tasks';

const enqueue = data => {
  return open.then(values => {
    const conn = values;
    var ok = conn.createChannel();
    ok = ok.then(function(ch) {
      ch.assertQueue(queue);
      ch.sendToQueue(queue, new Buffer(data));
    });
    return ok;
  });
};

module.exports = { enqueue };
