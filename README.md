# atlan-challenge
My solution for Atlan Backend Engineering Internship Task

To build the API, run ```docker-compose up --build```  inside atlan-challenge directory.

The solution uses worker threads. Every time a submit request is made, a new worker thread is created to run the query. 
Once the query completes or fails, the worker thread dies and query is cancelled.

The query runs inside a transaction to keep the update atomic. 
- If user pauses the update, the connection in that new thread is paused.
- If the user then clicks on resume, that connection can now be resumed.
- If user cancels, the connection will be destroyed and new connection is allocated in its place. 
    (In such a case, the transaction will anyway be rolled back, so partial update isn't an issue here)
    
 Hope to hear back from you guys soon!
