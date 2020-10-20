DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Game;


CREATE TABLE Player(
    ID integer PRIMARY KEY;
    name varchar(30);
)

CREATE TABLE Game(
    ID integer PRIMARY KEY;
    numeric gameCode;
)