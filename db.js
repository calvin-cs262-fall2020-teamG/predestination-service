const pgp = require('pg-promise')();
const db = pgp({
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT,
    database: process.env.DB_USER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // The “tiny turtle” plan https://www.elephantsql.com/plans.html only allows up to 5 concurrent connections.
    // Ensure there are way fewer than that in case we run multiple instances.
    max: 2,
});
module.exports = db;
