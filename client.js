const io = require('socket.io-client')
const socket = io('https://predestination-service.herokuapp.com')
socket.on('duh', () => {
    console.log('Connected!');
});