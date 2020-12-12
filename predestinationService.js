/**
 * REST-inspired webservice for the Predestination DB
 * @author: Ethan Walters
 * @date: 10/27/2020
 */

const db = require('./db');

/** Setup express server */
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();
router.use(express.json());

/** Setup express routes */
router.get("/", readHelloMessage);
router.get("/clues", readClues);
router.get("/clues/:id", readClue);

app.use(router);
app.use(errorHandler);
app.listen(port, () => console.log(`Listening on port ${port}`));

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
