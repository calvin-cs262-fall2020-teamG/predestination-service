# CS 262 Team G

### Predestination Service Repo

To find out more about our project, please check our [project repo](https://github.com/calvin-cs262-fall2020-teamG/predestination-project).
To find out more about our client, please check our [client repo](https://github.com/calvin-cs262-fall2020-teamG/predestination-client).

Our backend is deployed on Heroku, running with NodeJS and using PostgreSQL for our database backend which is hosted on ElephantSQL.
We are using the [pg-promise](https://github.com/vitaly-t/pg-promise) library in order to communicate between NodeJS and Postgres.

A major feature implemented into our app is the use of the [Socket.io](http://socket.io/) library. This enables
realtime, bidirectional and event-based communication. Sockets allow us to create a running game that multiple
players (seekers) can join at once. When they unlock/find a clue, it's updated on both the client and server
and sends a message to all other players. This also allows us to update the leaderboard in real-time.