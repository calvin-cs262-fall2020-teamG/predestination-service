/**
 * REST-inspired webservice for the Predestination DB
 * @author: Ethan Walters
 * @date: 10/27/2020
 */

const pgp = require('pg-promise')();
const db = pgp({
    host: "raja.db.elephantsql.com",
    port: 5432,
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

/* Game Server Code
 * @author: Jacob Brink
 * 
 * Completed: 
 *  - clients can join game and get current game state
 *  - clients can update others
 * 
 * Todo:
 *  - finish joinGame database selection to retreive player data along with a sum of their points
 *  - handle player quitting
 *  - test with and connect to client side
 */


const server = require('http').createServer(app);
const options = {};
const io = require('socket.io')(server, options);

io.on('connection', socket => {
    
    socket.on('join-session', (gameCode, playerID) => {
        joinGame(socket, gameCode, playerID);
    });
    
    // updates all players in a game sesion with new information
    socket.on('found-clue', (gameCode, playerID, clueID, timeStamp) => {
        socket.to(gameCode).emit('update', playerID, clueID, timeStamp);
    });

});

/* joinGame prepares player for game by giving current snapshot of game to client and subscribing them to the room identified by the gameCode
 */
const joinGame = async (socket, gameCode, playerID) => {
    const data = await db.many(`SELECT PlayerID, name, profilePictureURL, points FROM PlayerGame, Player, CluePlayer, Clue WHERE playerID=Player.ID AND gameID=${gameCode} AND Clue.gameID=${gameCode}`); //todo
    socket.emit('players-snapshot', data);
    socket.join(gameCode);
}

const router = express.Router();
router.use(express.json());

/** Setup express routes */



function errorHandler(err, req, res) {
    if (app.get('env') === "development") {
        console.log(err);
    }
    res.sendStatus(err.status || 500);
}

// @params: Google userid
// Postcondition: if user does not exist in table, add user
const signInUser = async (req, res, next) => {
    try {
        await db.none('INSERT INTO Player(ID, name, profilePictureURL) VALUES (${googleid}, ${name}, ${profilePictureURL}) ON DUPLICATE KEY UPDATE SET profilePictureURL=${profilePictureURL}, name=${name}', req.body);
    } catch (err) {
        next(err);
    }
}

// @params: user ID
// returns: user name, user photo URL
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
    db.oneOrNone('SELECT * FROM Clue WHERE id=${clueid}', req.params)
    .then(data => {
        returnDataOr404(res, data);
    })
    .catch(err => {
        next(err);
    })
};

router.get("/", readHelloMessage);
router.get("/clues", readClues);
router.get("/clues/:clueid", readClue);
router.get("/user/:googleid/signin/", signInUser);
router.get("/user/:googleid/profile/", getUserData);
router.get("/game/:gameid/players", getGamePlayers);
router.get("/game/:gameid/seeker/:googleid/clues", getPlayerClues);
router.get("/game/:gameid/seeker/:googleid/addpoints/:clueid/:time", updatePlayerClues);




app.use(router);
app.use(errorHandler);