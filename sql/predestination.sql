-- Basic SQL tables for the Predestination service
-- with included sample data

-- Updated by Ethan Walters 10/19/2020

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

GRANT SELECT ON Player TO PUBLIC;
GRANT SELECT ON Game TO PUBLIC;

INSERT INTO Player VALUES (1, Ethan)
INSERT INTO Player VALUES (2, Jacob)
INSERT INTO Player VALUES (3, Nathan)
INSERT INTO Player VALUES (4, Hayworth)
INSERT INTO Player VALUES (5, Advait)

INSERT INTO Game VALUES (1, 987929)
INSERT INTO Game VALUES (2, 239682)
INSERT INTO Game VALUES (3, 349583)