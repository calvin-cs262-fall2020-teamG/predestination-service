/**
 * REST-inspired webservice for the Predestination DB
 * @author: Ethan Walters
 * @date: 10/27/2020
 */


const pgp = require('pg-promise')();
const db = pgp({
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT,
    database: process.env.USER,
    user: process.env.USER,
    password: process.env.DB_PASSWORD
});

/** Setup socket.io server */

/** Setup express server */
const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const socketPort = 3000;
const webPort = 3001;

http.listen(socketPort, () => {
  console.log(`listening on *:${socketPort}`);
});

io.on('connect', (socket) => {
    socket.emit('duh', 'aaa');
    console.log("Connected!");
});

const router = express.Router();
router.use(express.json());

/** Setup express routes */
router.get("/", readHelloMessage);
router.get("/clues", readClues);
router.get("/clues/:id", readClue);

app.use(router);
app.use(errorHandler);
//app.listen(webPort, () => console.log(`Listening on port ${webPort}`));

function errorHandler(err, req, res) {
    if (app.get('env') === "development") {
        console.log(err);
    }
    res.sendStatus(err.status || 500);
}

/** If data isn't found return 404 otherwise, send required data */
function returnDataOr404(res, data) {
    if (data == null) {
        res.sendStatus(404);
    } else {
        res.send(data);
    }
}

/** Sends a simple hello message - for testing */
function readHelloMessage(req, res) {
    res.send('Hello, Predestination Service!');
}

/** Reads and returns all clues in the Clue table */
function readClues(req, res, next) {
    db.many("SELECT * FROM Clue")
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        next(err);
    })
}

/** Reads and returns a clue by its ID */
function readClue(req, res, next) {
    db.oneOrNone('SELECT * FROM Clue WHERE id=${id}', req.params)
    .then(data => {
        returnDataOr404(res, data);
    })
    .catch(err => {
        next(err);
    })
}
