/**
 * REST-inspired webservice for the Predestination DB
 * @author: Ethan Walters
 * @date: 10/27/2020
 */

// import { initializeServer } from '/server.js';

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
const router = express.Router();
router.use(express.json());

app.use(router);
app.use(errorHandler);

/** Check port in environment variable first, otherwise run on 3000 */
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

// Sends a simple hello message - for testing
function readHelloMessage(req, res) {
    res.send('Hello, Predestination Service!');
}

function errorHandler(err, req, res) {
    if (app.get('env') === "development") {
        console.log(err);
    }
    res.sendStatus(err.status || 500);
}

/*
returnDataOr404 sends required data unless its state is null
@params: data-
 */
function returnDataOr404(res, data) {
    if (data == null) {
        res.sendStatus(404);
    } else {
        res.send(data);
    }
}

/*
signInUser updates the Player table with corresponding Google account data
Postcondition: if user does not exist in table, add user
@params: Google userid
 */
const signInUser = async (req, res, next) => {
    try {
        await db.none('INSERT INTO Player(ID, name, profilePictureURL) VALUES (${googleid}, ${name}, ${profilePictureURL}) ON DUPLICATE KEY UPDATE SET profilePictureURL=${profilePictureURL}, name=${name}', req.body);
    } catch (err) {
        next(err);
    }
};

/*
getUserData retrieves Google account data from the Player data
@params: user ID
returns: username, photo URL
 */
const getUserData = async  (req, res, next) => {
    try {
        const data = await db.oneOrNone(
            `SELECT * FROM Player
            WHERE ID=${googleid}`
        );
        res.send(data);
    } catch (err) {
        next(err);
    }
}

// @params: user ID,
// returns: list of clues, noting which ones were received and not received
const getPlayerClues = async (req, res, next) => {
    try {
        const data = await db.many("SELECT * FROM CluePlayer, Clue WHERE CluePlayer.playerID=${googleid} AND WHERE CluePlayer.ClueID=Clue.ID AND WHERE Clue.gameID=${gameid}", req.body);
        res.send(data);
    } catch (err) {
        next(err);
    }
}

// called when player unlocked a clue
const updatePlayerClues = async (req, res, next) => {
    try {
        await db.none("INSERT IGNORE INTO CluePlayer (ClueID, playerID, time) VALUES (${clueid}, ${googleid}, ${time})", req.body);
    } catch (err) {
        next(err);
    }
}

// get list of players with game code
const getGamePlayers = async (req, res, next) => {
    try {
        const data = await db.many("SELECT playerID FROM PlayerGame WHERE gameID=${gameid}", req.body);
        res.send(data);
    } catch (err) {
        next(err);
    }
}

// Reads and returns all clues in the Clue table
function readClues(req, res, next) {
    db.many("SELECT * FROM Clue")
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            next(err);
        })
}

// Reads and returns a clue by its ID
function readClue(req, res, next) {
    db.oneOrNone('SELECT * FROM Clue WHERE id=${clueid}', req.params)
        .then(data => {
            returnDataOr404(res, data);
        })
        .catch(err => {
            next(err);
        });
}

router.get("/", readHelloMessage);
router.get("/clues", readClues);
router.get("/clues/:clueid", readClue);
router.get("/user/:googleid/signin/", signInUser);
router.get("/user/:googleid/profile/", getUserData);
router.get("/game/:gameid/players", getGamePlayers);
router.get("/game/:gameid/seeker/:googleid/clues", getPlayerClues);
router.get("/game/:gameid/seeker/:googleid/addpoints/:clueid/:time", updatePlayerClues);

// initializeServer();