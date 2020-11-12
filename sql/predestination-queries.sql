-- SQL script that implements sample queries for the Predestination database
-- @author: Ethan Walters
-- @date: 10/29/2020

-- Get all Game records
SELECT *
FROM Game;

-- Get all Player records
SELECT *
FROM Player;

-- Get the highest score
SELECT points
FROM Clue
ORDER BY points DESC
LIMIT 1;