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
    transports: ['websocket', 'polling']
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
    
    socket.on('join-room', (roomId, peerId, userName) => {
        console.log(`📌 Socket ${socket.id} joining room ${roomId} with peer ${peerId} as ${userName}`);
        
        // Store user info
        socket.userName = userName;
        socket.peerId = peerId;
        socket.roomId = roomId;
        
        // Join the room
        socket.join(roomId);
        
        // Tell everyone ELSE in the room that a new user connected
        socket.to(roomId).emit('user-connected', peerId, userName);
        
        // Send welcome message to the new user
        socket.emit('chat-message', {
            sender: 'System',
            message: `Welcome to the meeting!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            system: true
        });
        
        // Notify others that someone joined
        socket.to(roomId).emit('chat-message', {
            sender: 'System',
            message: `${userName} joined the meeting`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            system: true
        });
    });
    
    // Handle chat messages
    socket.on('send-chat-message', (roomId, messageData) => {
        console.log(`💬 Message in ${roomId} from ${messageData.sender}: ${messageData.message}`);
        
        // Add server timestamp if not provided
        if (!messageData.time) {
            messageData.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Send to everyone in the room INCLUDING sender
        io.to(roomId).emit('chat-message', messageData);
    });
    
    // Handle typing indicator
    socket.on('typing', (roomId, isTyping) => {
        socket.to(roomId).emit('user-typing', socket.userName, isTyping);
    });
    
    // Handle private messages
    socket.on('private-message', ({ toPeerId, message, fromName }) => {
        // Find socket by peerId and send private message
        const sockets = Array.from(io.sockets.sockets.values());
        const targetSocket = sockets.find(s => s.peerId === toPeerId);
        
        if (targetSocket) {
            targetSocket.emit('private-message', {
                from: fromName,
                fromPeerId: socket.peerId,
                message: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.roomId && socket.userName) {
            console.log(`❌ ${socket.userName} (${socket.id}) disconnected from room ${socket.roomId}`);
            
            // Notify others
            socket.to(socket.roomId).emit('chat-message', {
                sender: 'System',
                message: `${socket.userName} left the meeting`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                system: true
            });
            
            socket.to(socket.roomId).emit('user-disconnected', socket.peerId);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Open http://localhost:${PORT}`);
});