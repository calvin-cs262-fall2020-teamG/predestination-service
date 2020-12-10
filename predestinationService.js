/**
 * REST-inspired webservice for the Predestination DB
 * @author: Ethan Walters
 * @date: 10/27/2020
 */

const pgp = require('pg-promise')();
const db = pgp({
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT,
    database: process.DB_USER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

/** Setup express server */
const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

http.listen(port, () => {
    console.log(`listening on *:${port}`);
});

io.on('connect', (socket) => {

    socket.on('join-session', (gameCode, playerID) => {

	console.log(`Player ${playerID} joined a game with game code ${gameCode}!`);

	joinGame(gameCode, playerID, socket); // join the game via sockets and database

	socket.to(gameCode).emit('new-player', playerID); // send player join event to all other players in the same room

	// show new player how the game is currently
	deliverSnapshot(socket, gameCode);
	
	// give new player a snapshot of the current game
	socket.emit('players-snapshot', gameLog, playerData, clueData);

	// when this socket gets a clue, update all others
	socket.on('update', (clueID, timeStamp) => {
	    console.log(`Player ${playerID} found clue ${clueID}! Congratulations!`);
	    socket.to(gameCode).emit('update', playerID, clueID, timeStamp);
	});
	
    });
    
    console.log("Made a socket connection", socket.id);
    
});

// subscribes player to game room socket events and adds player to PlayerGame database
async function joinGame(gameCode, playerID, socket) {
    socket.join(gameCode); // subscribe socket to game room
    // TODO: add player to PlayerGame database
}

// delivers game snapshot to new players
async function deliverSnapshot (socket, gameCode) {
    const gameLog = await getGameLog(gameCode);
    const playerData = await getPlayerData(gameCode);
    const clueData = await getClueData(gameCode);
    socket.emit('players-snapshot', gameLog, playerData, clueData);
}

function addClue(gameCode, playerID, clueID, timeStamp) {
    // TODO: insert relevant data into the CluePlayer database
}

async function getGameLog(gameCode) {
    try {
	
    } catch (err) {
	
    };
    // TODO: should return a list of objects each with the following format
    // {
    //    playerID: STRING,
    //    clueID: INTEGER,
    //    timeStamp: MS SINCE EPOCH,
    // }
    return [];
}

async function getPlayerData(gameCode) {
    // TODO: should return a list of players each with the following format
    // {
    //    playerID: STRING,
    //    profileImageURL: STRING,
    //    displayName: STRING,
    // }
    return [];
}

async function getClueData(gameCode) {
    // TODO: should return a list of clues each with the following format
    // {
    //    clueID: STRING,
    //    Latitude: DOUBLE,
    //    Longitude: DOUBLE,
    //    description: STRING,
    // }
    return [];
}

const router = express.Router();
router.use(express.json());

app.use(router);
app.use(errorHandler);
// app.listen(port, () => console.log(`Listening on port ${port}`));

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



/*
getUserData retrieves Google account data from the Player data
@params: user ID
returns: username, photo URL
 */
const getUserData = async (req, res, next) => {
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

/*
 * joinGame prepares player for game by giving current snapshot of game to
 * client and subscribing them to the room identified by the gameCode
 */
const joinGame = async (socket, gameCode, playerID) => {
    const data = await db.many(`SELECT PlayerID, name, profilePictureURL, points FROM PlayerGame, Player, CluePlayer, Clue WHERE playerID=Player.ID AND gameID=${gameCode} AND Clue.gameID=${gameCode}`); //todo
    socket.emit('players-snapshot', data);
    socket.join(gameCode);
}

// function auth(req, res, next) {
//     const googleid = req.body.googleid;
//     const name = req.body.name;
//     const profilePictureURL = req.body.profilePictureURL;
// }

/*
signInUser updates the Player table with corresponding Google account data
Postcondition: if user does not exist in table, add user
@params: Google userid
 */
function createUser(req, res, next) {
    const googleid = req.body.googleid;
    const name = req.body.name;
    const profilePictureURL = req.body.profilePictureURL;
    console.log(googleid, name, profilePictureURL);
    db.none(`INSERT INTO Player(ID, name, "profilePictureURL") VALUES($1, $2, $3) ON CONFLICT (ID) DO UPDATE SET name=$2, "profilePictureURL"=$3`, [googleid, name, profilePictureURL]).then(
        data => {
            res.send(data);
        }
    ).catch(err => {
	next(err);
    })
}

/** Setup express routes */
router.get("/", readHelloMessage);
router.get("/clues", readClues);
router.get("/clues/:id", readClue);
router.post('/login', createUser);

//router.get("/user/:googleid/signin/", signInUser);
//router.get("/user/:googleid/profile/", getUserData);
router.get("/game/:gameid/players", getGamePlayers);
router.get("/game/:gameid/seeker/:googleid/clues", getPlayerClues);
router.get("/game/:gameid/seeker/:googleid/addpoints/:clueid/:time", updatePlayerClues);
