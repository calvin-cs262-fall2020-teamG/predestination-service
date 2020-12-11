-- Required SQL tables for the Predestination Service
-- @author: Ethan Walters
-- @date: 12/11/2020

DROP TABLE IF EXISTS Player;
-- DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS PlayerGame;
DROP TABLE IF EXISTS Clue;
DROP TABLE IF EXISTS CluePlayer;

CREATE TABLE Player
(
    id numeric NOT NULL,
    name character varying(50),
    "profilePictureURL" character(300),
    CONSTRAINT player_pkey PRIMARY KEY (id)
);

-- CREATE TABLE Game
-- (
--     ID SERIAL PRIMARY KEY,
--     gameCode integer
-- );

CREATE TABLE PlayerGame
(
    gameid integer,
    playerid numeric,
    CONSTRAINT playergame_playerid_fkey FOREIGN KEY (playerid)
        REFERENCES  Player (id)
);

CREATE TABLE Clue
(
    id integer NOT NULL,
    description text,
    points numeric,
    gameid integer,
    latitude numeric,
    longitude numeric,
    CONSTRAINT clue_pkey PRIMARY KEY (id)
);

INSERT INTO Clue (id, description, points, gameid, latitude, longitude) VALUES (1, 'broken and musty, the color slowly decaying, full of holes but not quite tasty.', 10, 123456, 45.396, -85.395);
INSERT INTO Clue (id, description, points, gameid, latitude, longitude) VALUES (2, 'music in my ears, echoing throughout the room.', 10, 123456, 41.334, -79.334);
INSERT INTO Clue (id, description, points, gameid, latitude, longitude) VALUES (3, 'Time gate from urban jungle to the untouched woods.', 5, 123456, 41.334, -79.334);
INSERT INTO Clue (id, description, points, gameid, latitude, longitude) VALUES (4, 'Spray painted and vandalized, once here, but now removed.', 5, 123456, 41.334, -79.334);
INSERT INTO Clue (id, description, points, gameid, latitude, longitude) VALUES (5, 'Challenge yourself, take the climb.', 1, 123456, 41.334, -79.334);

CREATE TABLE CluePlayer
(
    ClueID integer REFERENCES Clue(ID),
    playerID integer REFERENCES Player(ID),
    time timestamp,
    PRIMARY KEY (ClueID, playerID)
);

-- Give required permissions
GRANT SELECT ON Player TO PUBLIC;
GRANT SELECT ON PlayerGame TO PUBLIC;
GRANT SELECT ON Clue TO PUBLIC;
GRANT SELECT ON CluePlayer TO PUBLIC;
