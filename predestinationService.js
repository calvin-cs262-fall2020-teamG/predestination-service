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
    password: process.env.PASSWORD
});

/** Setup express server */
const express = require('express');
const app = express();
/** Check port in environment variable first, otherwise run on 3000 */
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

const router = express.Router();
router.use(express.json());

/** Setup express routes */
router.get("/", readHelloMessage);
router.get("/clues", readClues);
router.get("/clues/:id", readClue);

app.use(router);
app.use(errorHandler);


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
};
