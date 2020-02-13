/* begin transaction */
connection.beginTransaction(function (err) {
    console.log('Transaction will begin...')
    if (err) {
        console.log('ERROR: ', err); // code is crashing here.
        throw err;
    }

    connection.query('UPDATE sakila.customer SET ? WHERE create_date >= ? AND create_date <= ?', [{ active: uVal }, dateLB, dateUB], function (err, result) {
        console.log('query started.');
        if (err) {
            connection.rollback(function () {
                console.log('ERROR, database transaction rolled back.')
                throw err;
            });
        }

        // add pause event listener here.
        /*
        em.addListener('pause', function() {
            // wait for resume to be called.
        });
        */
        em.addListener('pause', function () {
            console.log('Event Listener pause request callback called.');
            // wait until resume event happens
            // pause the database transaction here. How do I do that?
            em.addListener('resume', function () {
                //connection.resume() --> find a function which can do this?
                console.log('Connection resumed');
            });
            console.log('done waiting for resume button press');
        });

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