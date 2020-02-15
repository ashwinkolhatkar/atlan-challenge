const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const events = require('events');
const {Worker, isMainThread} = require('worker_threads');

const app = express();

// Database connection
function initialiseConnection(){
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password@root123',
        database: 'sakila',
        multipleStatements: true
    });
}

let connection = initialiseConnection();

connection.connect(function(err) {
    if (err) console.log(err);
    else{console.log("##Successfully connected to MySQL container##");}
  });

connection.query('SET autocommit=0', function () {
    console.log('Disabled autocommit');
})

let worker_job;

app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Home Page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Upon form submission, the query will be made to change active rating in given date range.
app.post('/getData', function (req, res) {
    /* Once form is submitted with given date range, a database transaction will start in a new worker thread
     which will start querying database.
     */
    console.log("GOT DATA");
    console.log("Creating worker thread to run the query");
    if (isMainThread) {
        console.log('calling queryworker.js');
        worker_job = new Worker('./query_worker.js', {
            workerData: {
                drlb : req.body.drlb,
                drub : req.body.drub,
                uVal : req.body.update_val
            }
        });
      } else {
        console.log('Inside Worker!');
        console.log(isMainThread); 
      }

    res.send();
});

app.post('/pauseRequest', function (req, res) {
    console.log('Pausing...');
    worker_job.postMessage('pause'); // posting message to worker thread running query to pause its connection
    console.log('Paused');
    res.send('Paused');
});

app.post('/resumeRequest', function (req, res) {
    console.log('before Resume');
    worker_job.postMessage('resume'); // posting message to worker thread running query to pause its connection
    console.log('After resume');
});

app.post('/cancelRequest', function (req, res) {
    console.log("CANCELLING REQUEST");
    worker_job.postMessage('cancel'); // posting message to worker thread running query to destroy its connection
    res.send('Cancelled');
});

app.listen(PORT, function () {
    console.log('Server listening on port ', PORT);
});


function sleep(ms) {
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
}


