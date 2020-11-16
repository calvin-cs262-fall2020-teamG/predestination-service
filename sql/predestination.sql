-- Required SQL tables for the Predestination Service
-- @author: Ethan Walters
-- @date: 11/16/2020

DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS PlayerGame;
DROP TABLE IF EXISTS Clue;
DROP TABLE IF EXISTS CluePlayer;

CREATE TABLE Player
(
    ID SERIAL PRIMARY KEY,
    name varchar(50)
);

CREATE TABLE Game
(
    ID SERIAL PRIMARY KEY,
    gameCode integer
);

CREATE TABLE PlayerGame
(
    gameID integer REFERENCES Game(ID),
    playerID integer REFERENCES Player(ID)
);

CREATE TABLE Clue
(
    ID SERIAL PRIMARY KEY,
    description text,
    location point,
    points numeric,
    gameID integer REFERENCES Game(ID)
);

CREATE TABLE CluePlayer
(
    ClueID integer REFERENCES Clue(ID),
    playerID integer REFERENCES Player(ID),
    time timestamp
);

-- Give required permissions
GRANT SELECT ON Player TO PUBLIC;
GRANT SELECT ON Game TO PUBLIC;
GRANT SELECT ON PlayerGame TO PUBLIC;
GRANT SELECT ON Clue TO PUBLIC;
GRANT SELECT ON CluePlayer TO PUBLIC;
