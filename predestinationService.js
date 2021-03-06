/**
 * REST-inspired service and backend socket code for Predestination
 * @authors: Ethan Walters, Jacob Brink
 * @date: Fall, 2020
 */

const pgp = require('pg-promise')();

//https://vitaly-t.github.io/pg-promise/QueryFile.html
const {QueryFile} = require('pg-promise');

const db = pgp({
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT,
    database: process.DB_USER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 1, // ElephantSQL doesn't allow more than 5 concurrent connections, while pg-promise defaults to 10 connections
});

const initialize = async () => {
    try {
	db.task(t => {
	    return t.none(new QueryFile('sql/predestination.sql', {minify: true}));
	});
    } catch (err) {
	    console.log('Loading predestination.sql ran into an error');
	    console.log(err);
    }
}

initialize();

const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

http.listen(port, () => {
    console.log(`listening on *:${port}`);
});

// Server socket code
io.on('connect', (socket) => {

    socket.on('join-session', (gameCode, playerID) => {
	
	console.log(`Player ${playerID} joined a game with game code ${gameCode}!`);

	// show new player how the game is currently
	db.task(async (t) => {
	    await joinGame(gameCode, playerID, socket, t); // join the game via sockets and database
	    await deliverSnapshot(socket, gameCode, t);
	}).catch(error => {
	    console.log(error);
	});
	
	// when this socket gets a clue, update all others
	socket.on('update', (clueID, timeStamp) => {
	    db.task(t => {
		    console.log(`Player ${playerID} found clue ${clueID}`);
			return addClue(gameCode, playerID, clueID, timeStamp, socket, t); // handle the discovery of a clue
	    });
	});

    });
    console.log("Made a socket connection", socket.id);
});

/* joinGame()
 * @params: gameCode, playerID, socket
 * returns: void
 * postcondition: socket is subscribed to game room, and player is added to PlayerGame database
 */
async function joinGame(gameCode, playerID, socket, t) {
    socket.join(gameCode); // subscribe socket to game room
    try {
        return await t.none(`INSERT INTO PlayerGame(playerID, gameID) VALUES(${playerID}, ${gameCode}) ON CONFLICT ON CONSTRAINT ux_gameid_playerid DO NOTHING`).then(() => {
            return t.any(`SELECT * FROM Player WHERE id=${playerID}`).then(player => {
                if (player.length === 1) {
                    console.log('Sending player data!');
                    socket.to(gameCode).emit('new-player', playerID, null, player[0].name);
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
}

/* deliverSnapshot()
 * @params: socket, gameCode
 * returns: void
 * postcondition: socket is given necessary information to start the game
 */
async function deliverSnapshot(socket, gameCode, t) {        
    console.log("retreiving gameLog");
    const gameLog = await getGameLog(gameCode, t);
    console.log("retreiving playerData");
    const playerData = await getPlayerData(gameCode, t);
    console.log("retreiving clueData");
    const clueData = await getClueData(gameCode, t);
    console.log('send player snapshot');
    socket.emit('players-snapshot', gameLog, playerData, clueData);    
}

/**
 * addClue()
 * @params: gameCode, playerID, clueID, timeStamp, socket
 * @postcondition: broadcasts clue discovery to all sockets, except the one who discovered it, and updates database
 * @returns: void
 */
async function addClue(gameCode, playerID, clueID, timeStamp, socket, t) {
    console.log(`Player ${playerID} found clue ${clueID}! Congratulations!`);
    try {
	    await t.none(`INSERT INTO CluePlayer (ClueID, playerID, time) VALUES (${clueID}, ${playerID}, to_timestamp(${timeStamp}))`);
	    io.to(gameCode).emit('update', playerID, clueID, timeStamp);
    } catch (e) {
	console.log(e);
    }
    
}

/**
 *  getGameLog() gets the players ID associated with the clue ID
 * @params: gameCode
 * @returns: player id, clue id, time
 */
async function getGameLog(gameCode, t) {
    console.log(`t is ${t}`);
    return await t.any(`SELECT ClueID, playerID, time FROM Clue, CluePlayer WHERE Clue.gameID=${gameCode} AND Clue.ID=CluePlayer.ClueID`);
}

/**
 * getPlayerData() retrieves required player data form the Player table
 * that is need for our deliverSnapshot function. This returns google account information.
 * @params: gameCode
 * @returns: id (Google ID), name, profilePictureURL
 */
async function getPlayerData(gameCode, t) {
    return await t.any(`SELECT id, name, "profilePictureURL" FROM Player, PlayerGame WHERE PlayerGame.playerID=Player.ID AND PlayerGame.gameID=${gameCode}`);
}

/**
 * getClueData() retrieves required clue data from the Clue table
 * that is needed for our deliverSnapshot function.
 * @params: gameCode
 * @returns: clueid, description, latitude, longitude
 */
const getClueData = async (gameCode, t) => {
    return await t.any(`SELECT id, description, points, gameid, latitude, longitude FROM Clue WHERE gameid=${gameCode}`);
}

/**
 * signInUser updates the Player table with corresponding Google account data
 * @Postcondition: if user does not exist in table, add user
 * @params: Google userid
 */
function createUser(req, res, next) {
    const googleid = req.body.googleid;
    const name = req.body.name;
    const profilePictureURL = req.body.profilePictureURL;
    console.log(googleid, name, profilePictureURL);
    res.end('Logged in');
    db.task(t => {
        return t.none(`INSERT INTO Player(ID, name, "profilePictureURL") VALUES($1, $2, $3) ON CONFLICT (ID) DO UPDATE SET name=$2, "profilePictureURL"=$3`, [googleid, name, profilePictureURL]).then(
            data => {
                //res.send(data); throws H12 errors
            }
        ).catch(err => {
            next(err);
        });
    });
}

const router = express.Router();
router.use(express.json());

app.use(router);
app.use(errorHandler);

function errorHandler(err, req, res) {
    if (app.get('env') === "development") {
        console.log(err);
    }
    res.sendStatus(err.status || 500);
}

function returnDataOr404(res, data) {
    if (data == null) {
        res.sendStatus(404);
    } else {
        res.send(data);
    }
}

function readHelloMessage(req, res) {
    res.send('Hello, Predestination Service!');
}

/**
 * readClues and readClue return all clues and clues by their ID respectively. These can be accessed with
 * Express routes but aren't necessarily being utilized in our game because the sockets handle getting clue data
 * from our database
 * @param req
 * @param res
 * @param next
 * @returns: JSON object(s)
 */
function readClues(req, res, next) {
    db.many("SELECT * FROM Clue")
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            next(err);
        })
}

function readClue(req, res, next) {
    db.oneOrNone('SELECT * FROM Clue WHERE id=${id}', req.params)
        .then(data => {
            returnDataOr404(res, data);
        })
        .catch(err => {
            next(err);
        })
}

/**
 * getPlayer clues receives clues matched to the game id
 * @param req
 * @param res
 * @param next
 * @returns list of clues
 */
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

// Setup express routes
router.get("/", readHelloMessage);
router.get("/clues", readClues);
router.get("/clues/:id", readClue);
router.post('/login', createUser);

// These routes aren't being used
router.get("/game/:gameid/players", getGamePlayers);
router.get("/game/:gameid/seeker/:googleid/clues", getPlayerClues);
router.get("/game/:gameid/seeker/:googleid/addpoints/:clueid/:time", updatePlayerClues);