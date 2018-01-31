const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString: connectionString,
  ssl: true,  // necessary for local development
})

const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const open = require('amqplib').connect(url);
const queue = 'tasks';

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/endpoint', (req, res) => {
    if (!req.body.message) {
      res.status(500);
      res.send('Something broke!');
    }
    open.then(function(conn) {
      var ok = conn.createChannel();
      ok = ok.then(function(ch) {
        ch.assertQueue(queue);
        ch.sendToQueue(queue, new Buffer(req.body.message));
      });
      return ok;
    }).then(null, console.warn);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'success': true}));
  })
  .get('/db', (req, res) => {
    pool.query('SELECT * FROM test_table', (err, result) => {
      console.log(err, result)
      if (err) {
        console.error(err)
        res.send(err)
      } else {
        res.render('pages/db', {results: result.rows});
      }
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
