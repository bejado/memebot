const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString: connectionString,
  ssl: true,  // necessary for local development
})

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/endpoint', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'memebot': true}));
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
