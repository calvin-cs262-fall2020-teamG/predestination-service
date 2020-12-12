const db = require('./db');

db.many("SELECT * FROM Clue")
.then(function (data) {
    console.log(data);
})
.catch(function (error) {
    console.log('ERROR:', error)
});
