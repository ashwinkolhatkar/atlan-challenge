const Joi = require('joi');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const events = require('events');
//const child_process = require('child_process');

const app = express();
//const em = new events.EventEmitter();

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

// try to close connection / destroy and reinitialise that variable and get a brand new connection
// upgrade nodejs to 13+
// put query on a worker thread
// after kill query, kill the worker thread (or kill worker thread and then kill query)

connection.query('SET autocommit=0', function () {
    console.log('Disabled autocommit');
})



app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Home Page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Upon form submission, the query will be made to change active rating in given date range.
app.post('/getData', function (req, res) {
    /* Once form is submitted with given date range, a database transaction will start
     which will start querying database.
     */
    console.log("GOT DATA");
    //child_process.fork()
    //connection.
    getDataForDateRange(req.body.drlb, req.body.drub, req.body.update_val);

    res.send();
});

app.post('/pauseRequest', function (req, res) {
    /*
    console.log("PAUSING REQUEST");
    em.emit('pause');
    // now calling pause event listener in the transaction which will cancel the transaction
    console.log('yup, paused');
    */
    res.send('Paused');
    // mysql_thread_id()
    console.log('Paused.');
    console.log('THREAD ID: ');

    console.log('threadid before pause ', connection.threadId);
    connection.pause();
    console.log('threadid after pause ', connection.threadId);
});

app.post('/resumeRequest', function (req, res) {
    console.log('Resume');
    console.log('threaded before resume', connection.threadId);
    connection.resume();
    console.log('threadid at resume ', connection.threadId);
});



app.post('/cancelRequest', function (req, res) {
    console.log("CANCELLING REQUEST");
    // now calling cancel event listener in the transaction, which will cancel the transaction
    //console.log('threadid before c-pause', connection.threadId);
    //connection.pause();
    /*
    connection.rollback(function(){
        console.log('rolled back');
    });
    */

    connection.destroy();
    connection = initialiseConnection();
    console.log('Connection destroyed');
    //console.log('threadid after c-pause', connection.threadId);
    console.log('threadid before cancel ', connection.threadId);
    //try {
        /*
        connection.query('KILL QUERY ?', [connection.threadId], function (err, result) {
            //connection.resume();
            //console.log('threadid: ',connection.threadId);
            if (err) {
                connection.rollback(function () {
                    console.log('rolled back due to user cancelling');
                });
                console.log(err);
            }
            console.log('threadid after cancel', connection.threadId);
            
            console.log('killed thread');
        });
        */
        
    //} catch (e) {
        
    //}

    res.send('Cancelled');
});




app.listen(PORT, function () {
    console.log('Server listening on port ', PORT);
});


/*

function getDataForDateRange(dateLB, dateUB, uVal) {
    connection.beginTransaction(function (err) {
        console.log('Transaction will begin...')
        if (err) {
            console.log('ERROR: ', err); // code is crashing here.
            throw err;
        }

        // Step 1: Query to get the ids. We will then use these ids to add one query at a time to the db.
        // SELECT id from sakila.customer WHERE create_date >= ? AND create_date <=?
        connection.query('SELECT customer_id from sakila.customer WHERE create_date >= ? AND create_date <= ?', [dateLB, dateUB], function (err, rows, fields) {
            console.log('query started.');
            if (err) {
                throw err;
            }
            let cids = JSON.parse(JSON.stringify(rows));


            
        });
    });


}
*/


function getDataForDateRange(dateLB, dateUB, uVal) {
    connection.beginTransaction(function (err) {
        
        console.log('Transaction will begin...')
        if (err) { throw err; } // throw custom error here.


        let test = true;
        // Step 1: Query to get the ids. We will then use these ids to add one query at a time to the db.
        // SELECT id from sakila.customer WHERE create_date >= ? AND create_date <=?
        let sql = 'UPDATE sakila.customer SET ? WHERE create_date >= ? AND create_date <=?;';
        if (test) {
            sql = 'SELECT SLEEP(10);' + sql + 'SELECT SLEEP(10);';
        }
        console.log('query started.');
        // create worker thread.
        connection.query(sql, [{ active: uVal }, dateLB, dateUB], function (err, rows, fields) {
            console.log('query finished.');
            console.log('query threadid ', connection.threadId);
            if (err) {
                throw err;
            }
            let cids = JSON.parse(JSON.stringify(rows));

            // KILL QUERY
            // 

            // All queries are successfully updated, and ready to commit.
            connection.commit(function (err) {
                if (err) {
                    connection.rollback(function () {
                        throw err;
                    });
                }
                console.log('successfully committed');
            });

        });
    });
}

function sleep(ms) {
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
}


