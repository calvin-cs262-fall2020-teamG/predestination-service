-- Required SQL tables for the Predestination Service
-- @author: Ethan Walters
-- @date: 10/27/2020

DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS PlayerGame;
DROP TABLE IF EXISTS Clue;
DROP TABLE IF EXISTS CluePlayer;

CREATE TABLE Player(
    ID SERIAL PRIMARY KEY,
    name varchar(50)
);

CREATE TABLE Game(
    ID SERIAL PRIMARY KEY,
    gameCode numeric
);

CREATE TABLE PlayerGame(
    gameID integer REFERENCES Game(ID),
    playerID integer REFERENCES Player(ID)
);

CREATE TABLE Clue(
    ID integer PRIMARY KEY,
    description text,
    location point,
    points numeric,
    gameID integer REFERENCES Game(ID)
);

CREATE TABLE CluePlayer(
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

-- Sample data
INSERT INTO Player(name) VALUES (Ethan)
INSERT INTO Player(name) VALUES (Jacob)
INSERT INTO Player(name) VALUES (Nathan)
INSERT INTO Player(name) VALUES (Hayworth)
INSERT INTO Player(name) VALUES (Advait)

INSERT INTO Game(gameCode) VALUES (987929)
INSERT INTO Game(gameCode) VALUES (239682)
INSERT INTO Game(gameCode) VALUES (349583)