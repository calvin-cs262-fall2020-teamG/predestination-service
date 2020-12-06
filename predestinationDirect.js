const pgp = require('pg-promise')();
const db = pgp({
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT,
    database: process.env.DB_USER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

db.many("SELECT * FROM Clue")
.then(function (data) {
    console.log(data);
})
.catch(function (error) {
    console.log('ERROR:', error)
});
