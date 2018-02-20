const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const { createJob, getJobStatus } = require('./database');
const { enqueue } = require('./queue');
const RateLimit = require('express-rate-limit');

// Rate limiter for basic API endpoints
const apiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30,
  delayMs: 0
});

const jobEnqueueLimiter = new RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10,
  message: 'Too many requests from this IP, please try again after an hour.'
});

const app = express()
  .use(express.static(path.resolve(__dirname, '../react-ui/build')))
  .use(bodyParser.json())

  // api
  .get('/api/job/:job_id', apiLimiter, (req, res) => {
    const job_id = req.params.job_id;
    getJobStatus(job_id).then(
      result => {
        res.json(result);
      },
      error => {
        if (error.message === 'Job not found') {
          res.status(404);
        } else {
          res.status(500);
        }
        res.json({ error: error.message });
      }
    );
  })
  .post('/api/job', jobEnqueueLimiter, (req, res) => {
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

app.enable('trust proxy');

module.exports = app;
