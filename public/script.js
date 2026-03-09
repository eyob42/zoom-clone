console.log('🚀 Script starting...');

const socket = io('/', {
    transports: ['polling', 'websocket']
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.setAttribute('data-peer', 'self');

let myVideoStream;
let myPeerId;

const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
});

// Get user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        console.log('📹 Got local stream');
        myVideoStream = stream;
        addVideoStream(myVideo, stream, 'self');
    })
    .catch(err => {
        console.error('❌ Media error:', err);
        videoGrid.innerHTML = `<div style="color:red">Camera access denied</div>`;
    });

myPeer.on('open', id => {
    myPeerId = id;
    console.log('✅ My peer ID:', id);
    console.log('📡 Emitting join-room with:', ROOM_ID, id);
    socket.emit('join-room', ROOM_ID, id);
});

// Answer incoming calls - SINGLE HANDLER
myPeer.on('call', call => {
    console.log('📞 INCOMING CALL FROM:', call.peer);
    
    if (myVideoStream) {
        console.log('Answering call with stream...');
        call.answer(myVideoStream);
        
        const video = document.createElement('video');
        video.setAttribute('data-peer', call.peer);
        
        call.on('stream', userVideoStream => {
            console.log('📹 RECEIVED STREAM FROM:', call.peer);
            addVideoStream(video, userVideoStream, call.peer);
        });
        
        call.on('close', () => {
            console.log('Call closed with:', call.peer);
            if (video.parentNode) video.remove();
        });
        
        call.on('error', (err) => {
            console.error('Call error:', err);
        });
    }
});

// Listen for new users
socket.on('user-connected', userId => {
    console.log('👤 USER CONNECTED EVENT RECEIVED:', userId);
    
    if (myVideoStream) {
        console.log('📞 Calling new user:', userId);
        
        setTimeout(() => {
            try {
                const call = myPeer.call(userId, myVideoStream);
                
                if (!call) {
                    console.error('Failed to create call');
                    return;
                }
                
                console.log('✅ Call created, waiting for stream...');
                
                const video = document.createElement('video');
                video.setAttribute('data-peer', userId);
                
                call.on('stream', userVideoStream => {
                    console.log('📹 GOT STREAM FROM:', userId);
                    addVideoStream(video, userVideoStream, userId);
                });
                
                call.on('close', () => {
                    console.log('Call closed with:', userId);
                    if (video.parentNode) video.remove();
                });
                
                call.on('error', (err) => {
                    console.error('Call error:', err);
                });
                
            } catch (err) {
                console.error('Error creating call:', err);
            }
        }, 500);
    }
});

socket.on('user-disconnected', userId => {
    console.log('👋 User disconnected:', userId);
    const videoToRemove = document.querySelector(`video[data-peer="${userId}"]`);
    if (videoToRemove) videoToRemove.remove();
});

socket.on('connect', () => {
    console.log('🔌 Socket connected!');
});

function addVideoStream(video, stream, peerId) {
    video.srcObject = stream;
    video.setAttribute('data-peer', peerId);
    
    video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('Play error:', e));
    });
    
    videoGrid.appendChild(video);
    console.log(`✅ Added video for ${peerId}`);
}

// Optional: Monitor connections
setInterval(() => {
    console.log('📊 Videos in grid:', videoGrid.children.length);
}, 10000);