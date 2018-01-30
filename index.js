const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString: connectionString,
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
  .get('/db', (req, response) => {
    pool.query('SELECT NOW()', (err, res) => {
      console.log(err, res)
      if (err) {
        response.send(err)
      } else {
        response.send(res)
      }
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
