/* Game Server Code
 * @authors: Jacob Brink, Ethan Walters
 * Completed:
 *  - clients can join game and get current game state
 *  - clients can update others
 *
 * Todo:
 *  - finish joinGame database selection to retrieve player data along with a sum of their points
 *  - handle player quitting
 *  - test with and connect to client side
 */

import { db } from '/predestinationService.js';

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 4000;
server.listen(port, () => console.log("server is running on port:" + port));

export function initializeServer() {
    io.on("connection", socket => {

        console.log("a user connected");

        socket.on('join-session', (gameCode, playerID) => {
            joinGame(socket, gameCode, playerID);
        });

        // updates all players in a game session with new information when a player finds a clue
        socket.on('found-clue', (gameCode, playerID, clueID, timeStamp) => {
            socket.to(gameCode.emit('update', playerID, clueID, timeStamp));
        })
    })

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
