
/* Begin transaction */
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

        //console.log(cids);


        let isPaused = false;
        em.addListener('pause', function() {
            console.log('isPaused = TRUE');
            isPaused = true;
        });

        em.addListener('resume', function() {
            console.log('isPaused = FALSE')
            isPaused = false;
        });

        // for loop going through the ids and updating each entry. (for int i....)
        for (let index = 0; index < cids.length; index++) {
            while(isPaused == true){
                // wait for resume here.
                sleep(700);
                console.log('WAITING FOR RESUME');
                console.log('in for loop: isPaused = ', isPaused);
            }
            // UPDATE sakila.customer SET ? WHERE id=?', [{active: uVal}, i]
            connection.query('UPDATE sakila.customer SET ? WHERE customer_id=?', [{ active: uVal }, cids[index].customer_id], function (err, result) {
                console.log(cids[index].customer_id);
                sleep(700); // the sleep has been put to demonstrate that the query takes a long time to execute.
            });
        }

        // also add cancel event listener here.
        em.addListener('cancel', function () {
            connection.rollback(function () {
                console.log('CANCELLED transaction upon user request');
                console.log('transaction has been rolled back due to user cancelling transaction.');
            });
        });

        connection.commit(function(err) {
            if (err) {
                connection.rollback(function() {
                    throw err;
                });
            }
            console.log('successfully committed');
        });
    });
});
/*

/* End transaction */