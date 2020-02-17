# atlan-challenge
My solution for Atlan Backend Engineering Internship Task

To build the API, run ```docker-compose up --build```  inside atlan-challenge directory.

The solution uses worker threads and transactions. Every time a submit request is made, a new worker thread is created to run the query. The query will run in a transaction. 

Once the query completes or fails, the query is cancelled and the worker thread dies.

The query runs inside a transaction to keep the update atomic. 
- If user pauses the update, the connection in that new thread is paused.
- If the user then clicks on resume, that connection can now be resumed.
- If user cancels, the connection will be destroyed, and then worker thread will be killed. 
    (In such a case, the transaction will anyway be rolled back by the ```nodejs-mysql module```, so partial update isn't an issue here)
- If the user does not pause, cancel or resume the transaction, and the query successfully completes, it will be committed to the database.
    
 Hope to hear back from you guys soon!
