var express = require('express');
var bodyParser = require('body-parser');
var morgan = require("morgan");

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/dogbase.sqlite3');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/index.html');
});

app.get('/dogs/:dogname', function (req, res) {
    res.sendFile(__dirname + '/html/dog.html');
});

// AJAX calls
app.get('/dogs/:dogname/info', (req, res) => {
    sqlString = 'select * from dogs, messages WHERE dogs.name = \'' + req.params.dogname + '\' AND messages.dog_id = dogs.id';
    db.all(
        sqlString,
        [],
        (err, rows) => {
            console.log(rows);
            res.send(rows);
        }
    );
});

app.post('/dogs/:dogname/update', (req, res) => {
    console.log('post body', req.body);
    var sqlString = `SELECT id FROM dogs WHERE name='${req.params.dogname}'`;

    var dogId;
    db.get(
        sqlString,
        [],
        (err, row) => {
            if (!err) {
                dogId = row.id;
                var insertString = 'INSERT INTO messages (dog_id, message) VALUES ($dogId, $msg)';
                db.run(
                    insertString,
                    {
                        $dogId: dogId,
                        $msg: req.body.message,
                    },
                    (err) => {
                        if (!err) {
                            res.send({ message: req.body.message });
                        } else {
                            res.send({ err: err });
                        }
                    }
                );
            } else {
                console.log('error', err);
            }
        }
    )
});

app.get('/dogs', function (req, res, next) {
    let dogRows;

    db.all(
        'SELECT * FROM dogs'
      , [], (err, rows) => {
        if (err) {
          console.log('ERROR: ', err);
        }

        if (rows.length > 0) {
            console.log(rows);
          res.send(rows);
        } else {
            console.log('no dogs');
          res.send([]);
        }
      });
});

var http = require('http').Server(app);
http.listen(3000, function() {
    console.log('listening on 3000');
});
