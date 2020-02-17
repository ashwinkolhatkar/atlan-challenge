const worker = require('worker_threads');
const {port1, port2} = new worker.MessageChannel();
const mysql = require('mysql');


worker.parentPort.on('message', function(message) {
    console.log(message);
    if(message=='pause'){
        console.log('pausing connection');
        connection.pause();
    }
    if(message=='resume'){
        connection.resume();
    }
    if(message=='cancel'){
        console.log('cancelling in worker thread.');
        // KILL query logic over here.
       // connection.resume();
        connection.destroy();
        console.log('destroyed connection.');
        connection = initialiseConnection();
        //worker.parentPort.postMessage('kill-thread');
        console.log('killing thread ', worker.threadId);
        process.exit(0);
    }
});

// Database connection
function initialiseConnection(){
    return mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'password@root123',
        database: 'sakila',
        multipleStatements: true
    });
}

let connection = initialiseConnection();


function getDataForDateRange(dateLB, dateUB, uVal) {
    connection.beginTransaction(function (err) {
        
        console.log('Transaction will begin...')
        console.log('Transaction thread id', worker.threadId);
        if (err) { throw err; } // throw custom error here.


        let test = true;

        let sql = 'UPDATE sakila.customer SET ? WHERE create_date >= ? AND create_date <=?;';
        if (test) {
            sql = 'SELECT SLEEP(10);' + sql + 'SELECT SLEEP(10);';
        }
        console.log('query started.');
        // create worker thread.
        connection.query(sql, [{ active: uVal }, dateLB, dateUB], function (err, rows, fields) {
            
            console.log('query running.');
            console.log('query threadid ', connection.threadId);
            if (err) {
                throw err;
            }
            let cids = JSON.parse(JSON.stringify(rows));

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


const dateLB = worker.workerData.dateLB;
const dateUB = worker.workerData.dateUB;
const uVal = worker.workerData.uVal;


console.log('Thread id is: ', worker.threadId);
console.log('Worker thread will now start the query');
getDataForDateRange(dateLB, dateUB, uVal);


function sleep(ms) {
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
}
