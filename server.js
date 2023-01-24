var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//On regarde les évènement connect
io.on('connection', (socket) => {
    console.log(`Un utilisateur vient de se connecter`);
    //On regarde les évènement connect
    socket.on('disconnect', () => {
        console.log(`Un utilisateur vient de se déconnecter`);
    });
    
    let eventName = 'simple chat message';
    
    //Affichage du message et tempo de 1 seconde pour éviter les spams 
    let broadcast = (msg) => socket.broadcast.emit(eventName, msg);
    socket.on(eventName, (msg, ackFn) => {
        console.log('message: ' + msg);
        // broadcast to other clients after 1 seconds
        setTimeout(broadcast, 1000, msg);
    });
});

http.listen(3000, () => {
    console.log('Serveur ON');
});