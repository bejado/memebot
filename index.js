const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const pg = require('pg')

var pool = new pg.Pool()

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
    pool.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('SELECT * FROM test_table', function(err, result) {
        done();
        if (err) {
          console.error(err); res.send("Error " + err);
        } else {
          res.render('pages/db', {results: results.rows} );
        }
      });
    });
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
