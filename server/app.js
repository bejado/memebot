const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const { createJob, getJobStatus } = require('./database');
const { enqueue } = require('./queue');

const app = express()
  .use(express.static(path.resolve(__dirname, '../react-ui/build')))
  .use(bodyParser.json())

  // api
  .get('/api/job/:job_id', (req, res) => {
    const job_id = req.params.job_id;
    getJobStatus(job_id).then(
      result => {
        res.json(result);
      },
      error => {
        res.status(400);
        res.json({ error: error });
      }
    );
  })
  .post('/api/job', (req, res) => {
    if (!req.body.message) {
      res.status(400);
      res.send('A message is required');
      return;
    }
    const message = req.body.message;
    const hash = crypto
      .createHash('md5')
      .update(message)
      .digest('hex');
    const createJobPromise = createJob(hash);
    const enqueueJobPromise = enqueue(req.body.message);

    // After the job is enqueued, issue a response
    Promise.all([createJobPromise, enqueueJobPromise]).then(
      () => {
        res.json({ success: true, id: hash });
      },
      err => {
        console.warn(err);
        res.status(500);
        res.send('Something broke!');
      }
    );
  })

  // Remaining requests directly to React for routing
  .get('*', function(req, res) {
    console.log('catch all');
    res.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

module.exports = app;
