const socket = io('/');
const videoGrid = document.getElementById('video-grid');  // video
const myVideo = document.createElement('video');   // video-tag
let myVideoStream;
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then((stream)=>{
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
});

socket.emit('join-room', ROOM_ID);

socket.on('user-connected', ()=>{
    console.log('New user connected to room');
    connectToNewUser();
})

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function connectToNewUser() {
    console.log('Abebe front connected');
}