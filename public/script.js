$(document).ready(function() {
    const socket = io('/');
    const videoGrid = document.getElementById('video-grid');
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    myVideo.setAttribute('data-peer', 'self');

    let myVideoStream;
    let myPeerId;
    let userName = `User_${Math.random().toString(36).substr(2, 4)}`;

    const myPeer = new Peer(undefined, peerConfig);

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            myVideoStream = stream;
            addVideoStream(myVideo, stream, 'self');
        })
        .catch(err => {
            console.error('Media error:', err);
        });

    myPeer.on('open', id => {
        myPeerId = id;
        // Send userName when joining room
        socket.emit('join-room', ROOM_ID, id, userName);
        
        // Add self to participants list
        addParticipantToList(id, 'You');
    });

    // Socket.io events
    socket.on('user-connected', (userId, userName) => {
        console.log('User connected:', userId, userName);
        addParticipantToList(userId, userName || `User ${userId.slice(0, 4)}`);
        
        if (myVideoStream) {
            setTimeout(() => {
                const call = myPeer.call(userId, myVideoStream);
                handleCall(call, userId);
            }, 500);
        }
    });

    socket.on('user-disconnected', userId => {
        console.log('User disconnected:', userId);
        $(`video[data-peer="${userId}"]`).remove();
        $(`.participant-item[data-peer="${userId}"]`).remove();
    });

    // Chat functionality
    // Socket event for receiving messages
    socket.on('chat-message', (data) => {
        displayMessage(data);
        
        // Show notification if chat is closed
        if (!$('#chatSidebar').is(':visible')) {
            showToast(data);
            updateUnreadBadge();
        }
    });

    // Typing indicator
    let typingTimer;
    $('#chatInput, #mobileChatInput').on('input', function() {
        socket.emit('typing', ROOM_ID, true);
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            socket.emit('typing', ROOM_ID, false);
        }, 1000);
    });

    socket.on('user-typing', (userName, isTyping) => {
        if (isTyping) {
            $('#typingIndicator').text(`${userName} is typing...`).show();
        } else {
            $('#typingIndicator').hide();
        }
    });

    // Answer calls
    myPeer.on('call', call => {
        if (myVideoStream) {
            call.answer(myVideoStream);
            handleCall(call, call.peer);
        }
    });

    function handleCall(call, peerId) {
        const video = document.createElement('video');
        video.setAttribute('data-peer', peerId);
        
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, peerId);
        });
        
        call.on('close', () => {
            $(video).remove();
        });
    }

    function addVideoStream(video, stream, peerId) {
        video.srcObject = stream;
        video.setAttribute('data-peer', peerId);
        
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        
        videoGrid.appendChild(video);
    }

    // SINGLE displayMessage function - FIXED
    function displayMessage(data) {
        const messageHtml = data.system ? `
            <div class="message system">
                <div>${data.message}</div>
                <div class="message-time">${data.time}</div>
            </div>
        ` : `
            <div class="message ${data.senderId === myPeerId ? 'own' : 'other'}">
                <div class="message-sender">${data.sender}</div>
                <div>${data.message}</div>
                <div class="message-time">${data.time}</div>
            </div>
        `;
        
        // Only append to main chat
        $('#chatMessages').append(messageHtml);
        
        // On mobile or when chat panel is open, sync the content
        if (window.innerWidth < 992 || $('#chatPanel').hasClass('show')) {
            $('#mobileChatMessages').html($('#chatMessages').html());
        }
        
        // Auto-scroll main chat
        $('#chatMessages').scrollTop($('#chatMessages')[0]?.scrollHeight || 0);
    }

    // Sync mobile chat when it's opened
    $('#chatPanel').on('shown.bs.offcanvas', function () {
        $('#mobileChatMessages').html($('#chatMessages').html());
        $('#mobileChatMessages').scrollTop($('#mobileChatMessages')[0]?.scrollHeight || 0);
    });

    // Also sync when sending from mobile
    $('#mobileSendMessage, #sendQuickMessage').on('click', function() {
        setTimeout(() => {
            $('#mobileChatMessages').html($('#chatMessages').html());
        }, 100);
    });

    function sendMessage() {
        const message = $('#chatInput').val().trim();
        const mobileMessage = $('#mobileChatInput').val().trim();
        const quickMessage = $('#quickMessage').val().trim();
        
        const msgToSend = message || mobileMessage || quickMessage;
        
        if (msgToSend) {
            const messageData = {
                sender: userName,
                senderId: myPeerId,
                message: msgToSend,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            // Send via socket
            socket.emit('send-chat-message', ROOM_ID, messageData);
            
            // Clear inputs
            $('#chatInput, #mobileChatInput, #quickMessage').val('');
        }
    }

    function showToast(data) {
        $('#toastBody').text(`${data.sender}: ${data.message}`);
        const toast = new bootstrap.Toast($('#liveToast')[0]);
        toast.show();
    }

    function updateUnreadBadge() {
        const badge = $('#unreadBadge');
        const count = parseInt(badge.text() || '0') + 1;
        badge.text(count).show();
    }

    function addParticipantToList(peerId, name) {
        // Check if participant already exists
        if ($(`.participant-item[data-peer="${peerId}"]`).length === 0) {
            const participantHtml = `
                <li class="list-group-item participant-item" data-peer="${peerId}">
                    <i class="fa-solid fa-user me-2"></i>
                    ${name}
                    ${peerId === myPeerId ? ' (You)' : ''}
                </li>
            `;
            $('#participantsList').append(participantHtml);
        }
    }

    // Event Listeners using jQuery
    $('#sendMessage, #mobileSendMessage, #sendQuickMessage').on('click', sendMessage);
    
    $('#chatInput, #mobileChatInput, #quickMessage').on('keypress', function(e) {
        if (e.which === 13) sendMessage();
    });
    
    $('#closeChat').on('click', function() {
        $('#chatSidebar').addClass('d-none');
    });
    
    // Mute button
    $('#muteBtn').on('click', function() {
        const enabled = myVideoStream?.getAudioTracks()[0]?.enabled;
        if (myVideoStream) {
            myVideoStream.getAudioTracks()[0].enabled = !enabled;
            $(this).toggleClass('muted');
            $(this).find('i').toggleClass('fa-microphone fa-microphone-slash');
            $(this).find('span').text(enabled ? 'Unmute' : 'Mute');
        }
    });
    
    // Video button
    $('#videoBtn').on('click', function() {
        const enabled = myVideoStream?.getVideoTracks()[0]?.enabled;
        if (myVideoStream) {
            myVideoStream.getVideoTracks()[0].enabled = !enabled;
            $(this).toggleClass('video-off');
            $(this).find('i').toggleClass('fa-video fa-video-slash');
            $(this).find('span').text(enabled ? 'Start Video' : 'Stop Video');
        }
    });
    
    // Leave button
    $('#leaveBtn').on('click', function() {
        window.location.href = '/';
    });
    
    // Reset unread badge when opening chat
    $('#chatBtn, #closeChat').on('click', function() {
        $('#unreadBadge').hide().text('0');
    });

    // Add typing indicator element to chat if not exists
    if ($('#typingIndicator').length === 0) {
        $('.chat-messages').after('<div id="typingIndicator" class="text-muted small p-2" style="display: none;"></div>');
    }
});