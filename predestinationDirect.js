const pgp = require('pg-promise')();
const db = pgp({
    host: "raja.db.elephantsql.com",
    port: 5432,
    database: process.env.USER,
    user: process.env.USER,
    password: process.env.PASSWORD
});

db.many("SELECT * FROM Clue")
.then(function (data) {
    console.log(data);
})
.catch(function (error) {
    console.log('ERROR:', error)
});
