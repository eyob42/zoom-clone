const express = require("express");
const app = express();

const server = require("http").Server(app);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, { 
    debug: true,
});

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'] // Allow both
});

const { v4: uuidv4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
    console.log('🔥 New socket connected:', socket.id);
    
    socket.on('join-room', (roomId, peerId) => {
        console.log(`📌 Socket ${socket.id} joining room ${roomId} with peer ${peerId}`);
        
        // Join the room
        socket.join(roomId);
        
        // Tell everyone ELSE in the room that a new user connected
        socket.to(roomId).emit('user-connected', peerId);
        
        // When this socket disconnects
        socket.on('disconnect', () => {
            console.log(`❌ Socket ${socket.id} disconnected from room ${roomId}`);
            socket.to(roomId).emit('user-disconnected', peerId);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Open http://localhost:${PORT}`);
});