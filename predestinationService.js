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

	// when this socket gets a clue, update all others
	socket.on('update', (clueID, timeStamp) => {
	    addClue(gameCode, playerID, clueID, timeStamp, socket); // handle the discovery of a clue
	});
	
    });
    
    console.log("Made a socket connection", socket.id);
    
});

/* joinGame()
 * @params: gameCode, playerID, socket
 * returns: void
 * postcondition: socket is subscribed to game room, and player is added to PlayerGame database
 */
async function joinGame(gameCode, playerID, socket) {
    socket.join(gameCode); // subscribe socket to game room
    // TODO: add player to PlayerGame database
    await db.none(`INSERT INTO PlayerGame(gameID, playerID) VALUES(${gameCode}, ${playerID}) ON CONFLICT (gameID, playerID) DO NOTHING`);
}

/* deliverSnapshot()
 * @params: socket, gameCode
 * returns: void
 * postcondition: socket is given necessary information to start the game
 */
async function deliverSnapshot(socket, gameCode) {
    console.log("retreiving gameLog");
    const gameLog = await getGameLog(gameCode);
    console.log("retreiving playerData");
    const playerData = await getPlayerData(gameCode);
    console.log("retreiving clueData");
    const clueData = await getClueData(gameCode);
    console.log('send player snapshot');
    socket.emit('players-snapshot', gameLog, playerData, clueData);
}

/* addClue() 
 * @params: gameCode, playerID, clueID, timeStamp, socket
 * postcondition: broadcasts clue discovery to all sockets, except the one who discovered it, and updates database
 * returns: void
 */
async function addClue(gameCode, playerID, clueID, timeStamp, socket) {
    console.log(`Player ${playerID} found clue ${clueID}! Congratulations!`);
    socket.to(gameCode).emit('update', playerID, clueID, timeStamp);
    // TODO: insert relevant data into the CluePlayer database
}

/* getGameLog() gets the players ID associated with the clue ID
 * @params: gameCode
 * returns: player id, clue id, time
 */
async function getGameLog(gameCode) {
    db.any(`SELECT ClueID, playerID, time FROM Clue, CluePlayer WHERE Clue.gameID=${gameCode} AND Clue.ID=CluePlayer.ClueID`)
            return data;
        })
        .catch(err => {
            console.log(err)
        });
    // TODO: should return a list of objects each with the following format
    // {
    //    playerID: STRING,
    //    clueID: INTEGER,
    //    timeStamp: MS SINCE EPOCH,
    // }

}

/* getPlayerData() retrieves required player data form the Player table
 * that is need for our deliverSnapshot function. This returns google account information.
 * @params: gameCode
 * @returns: id (Google ID), name, profilePictureURL
 */
async function getPlayerData(gameCode) {
    db.one(`SELECT id, name, "profilePictureURL" FROM Player, PlayerGame WHERE PlayerGame.playerID=Player.ID AND PlayerGame.gameID=${gameCode}`)
        .then(data => {
            return data;
        })
        .catch(err => {
            console.log(err)
        });
    // TODO: should return a list of players each with the following format
    // {
    //    playerID: STRING,
    //    profileImageURL: STRING,
    //    displayName: STRING,
    // }
}

/* getClueData() retrieves required clue data from the Clue table
 * that is needed for our deliverSnapshot function.
 * @params: gameCode
 * @returns: clueid, description, latitude, longitude
 */
const getClueData = async (gameCode) => {
    try {
        return await db.any(`SELECT id, description, points, gameid, latitude, longitude FROM Clue WHERE gameid=${gameCode}`);
    } catch (err) {
	console.log('getClueData ran into an error!!!!!!');
        console.log(err);
    }
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
        const data = await db.many("SELECT * FROM CluePlayer, Clue WHERE CluePlayer.playerID${googleid} AND WHERE CluePlayer.ClueID=Clue.ID AND WHERE Clue.gameID=${gameid}", req.body);
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
// async function joinGame(socket, gameCode, playerID) {
//     const data = await db.many(`SELECT PlayerID, name, profilePictureURL, points FROM PlayerGame, Player, CluePlayer, Clue WHERE playerID=Player.ID AND gameID=${gameCode} AND Clue.gameID=${gameCode}`); //todo
//     socket.emit('players-snapshot', data);
//     socket.join(gameCode);
// }

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
