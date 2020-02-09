const Joi = require('joi');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const app = express();


// Database connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password@root123',
    database: 'sakila'
  });

  

app.use(bodyParser.urlencoded({ extended: true })); 

const PORT = process.env.PORT || 3000;

// Home Page
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Upon form submission, the query will be made to change active rating in given date range.
app.post('/getData', function(req, res){
    /* Once form is submitted with given date range, a database transaction will start
     which will start querying database.
     */
    console.log("GOT DATA");
    console.log(req.body);
    //getDataForDateRange(res, dateLowerBound, dateUpperBound); // this function will query database, and write response

});

app.post('/pauseRequest', function(req, res){
    // pause the getData operation here.
    // Raise an event emitter, maybe?
    console.log("PAUSING REQUEST");
    console.log("Request body" + req.body);
});

app.post('/cancelRequest', function(req, res){
    // pause the getData operation here.
    // Raise an event emitter, maybe?
    console.log("CANCELLING REQUEST");
    console.log("Request body" + req.body);

    res.write('Cancelled');
});

app.post('/resumeRequest', function(req, res){
    // pause the getData operation here.
    // Raise an event emitter, maybe?
    console.log("RESUMING REQUEST");
    console.log("Request body" + req.body);
});


app.listen(PORT, function(){
   console.log('Server listening on port ', PORT); 
});


// REST API endpoint
// To be written in MySQL
function getDataForDateRange(res, dateFrom, dateTill){
/* Begin transaction */
connection.beginTransaction(function(err) {
    if (err) { throw err; }
    connection.query('INSERT INTO names SET name=?', "sameer", function(err, result) {
      if (err) { 
        connection.rollback(function() {
          throw err;
        });
        
      }

      // add pause event listener here.
      // also add cancel event listener here.
    });
  });
  /* End transaction */
}