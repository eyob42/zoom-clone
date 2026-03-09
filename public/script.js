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

socket.emit('join-room');

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}