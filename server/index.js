const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const crypto = require('crypto')
const { createJob, getJobStatus } = require('./database')

const PORT = process.env.PORT || 5000

const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const open = require('amqplib').connect(url);
const queue = 'tasks';

express()
  .use(express.static(path.resolve(__dirname, '../react-ui/build')))
  .use(bodyParser.json())

  // api
  .get('/api/job/:job_id', (req, res) => {
    const job_id = req.params.job_id
    getJobStatus(job_id).then((result) => {
      res.status(200);
      res.type('json')
      res.send(JSON.stringify(result));
    }, (error) => {
      res.status(400);
      res.type('json')
      res.send(JSON.stringify({'error': error}))
    });
  })
  .post('/api/job', (req, res) => {
    if (!req.body.message) {
      res.status(400);
      res.send('A message is required');
      return;
    }
    const message = req.body.message
    const hash = crypto.createHash('md5').update(message).digest('hex')
    const createJobPromise = createJob(hash)
    const enqueueJobPromise = Promise.all([open, createJobPromise]).then(function(values) {
      const conn = values[0]
      var ok = conn.createChannel();
      ok = ok.then(function(ch) {
        ch.assertQueue(queue);
        ch.sendToQueue(queue, new Buffer(req.body.message));
      });
      return ok;
    })

    // After the job is enqueued, issue a response
    enqueueJobPromise.then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({'success': true, 'id': hash}));
    }, (err) => {
      console.warn(err)
      res.status(500);
      res.send('Something broke!');
    });
  })

  // Remaining requests directly to React for routing
  .get('*', function (req, res) {
    console.log('catch all')
    res.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
