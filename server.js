const express = require("express");
const { Server } = require("http");
const { Socket } = require("socket.io");
const app = express();


const server = require("http").Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})
app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room});
})

io.on('connection', (socket) => {
    socket.on('join-room', (roomId)=> {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', socket.id);

        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected from room ${roomId}`);
            socket.broadcast.to(roomId).emit('user-disconnected', socket.id);
        });
    });
});

server.listen(process.env.PORT || 3000);