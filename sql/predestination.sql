-- Required SQL tables for the Predestination Service
-- @author: Ethan Walters
-- @date: 10/27/2020

DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS PlayerGame;
DROP TABLE IF EXISTS Clue;
DROP TABLE IF EXISTS CluePlayer;

CREATE TABLE Player(
    ID integer PRIMARY KEY,
    name varchar(50)
);

CREATE TABLE Game(
    ID integer PRIMARY KEY,
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
INSERT INTO Player VALUES (1, Ethan)
INSERT INTO Player VALUES (2, Jacob)
INSERT INTO Player VALUES (3, Nathan)
INSERT INTO Player VALUES (4, Hayworth)
INSERT INTO Player VALUES (5, Advait)

INSERT INTO Game VALUES (1, 987929)
INSERT INTO Game VALUES (2, 239682)
INSERT INTO Game VALUES (3, 349583)