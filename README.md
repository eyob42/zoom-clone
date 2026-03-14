# Zoom Clone - Video Conference App

![License](https://img.shields.io/badge/License-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black)
![PeerJS](https://img.shields.io/badge/PeerJS-1.5.x-yellow)

A real-time video conferencing application built with WebRTC, Socket.io, and PeerJS. This project mimics core Zoom functionalities including multi-participant video calls, group chat, screen sharing, and meeting controls.

**Live Demo:** [https://zoom-clone-wy7o.onrender.com](https://zoom-clone-wy7o.onrender.com)

## ✨ Features

- **Real-time Video & Audio** - High-quality peer-to-peer video calls using WebRTC
- **Multi-participant Support** - Join meetings with multiple users
- **Group Chat** - Real-time messaging with typing indicators
- **Screen Sharing** - Share your screen with participants
- **Meeting Controls** - Mute/unmute, start/stop video, leave meeting
- **Participant List** - See who's in the meeting
- **Responsive Design** - Works on desktop and mobile devices
- **Unique Room IDs** - Automatically generated meeting links
- **No Account Required** - Just share the link and join

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Real-time Communication:** Socket.io, WebRTC
- **Peer-to-Peer:** PeerJS
- **Frontend:** HTML5, CSS3, JavaScript, jQuery
- **UI Framework:** Bootstrap 5, Font Awesome
- **Templating:** EJS
- **Deployment:** Render

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern browser with WebRTC support (Chrome, Firefox, Edge, Safari)

## 🚀 Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zoom-clone.git
   cd zoom-clone
Install dependencies

bash
npm install
Start the development server

bash
npm start
For auto-restart during development:

bash
npx nodemon server.js
Open the application

Visit http://localhost:3000

You'll be automatically redirected to a unique room

🌐 Deployment on Render
This app is configured for easy deployment on Render:

Push your code to a GitHub repository

Create a new Web Service on Render

Connect your repository

Use these settings:

Build Command: npm install

Start Command: npm start

Environment: Node.js

The app includes automatic HTTPS support and dynamic PeerJS configuration for secure connections.

📁 Project Structure
text
zoom-clone/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── views/
│   └── room.ejs           # Main meeting room template
├── public/
│   ├── style.css          # Custom styles
│   └── script.js          # Client-side JavaScript
└── README.md              # This file
🎯 How It Works
Creating/Joining a Room

Visiting the root URL generates a unique UUID and redirects to /:roomId

Multiple users with the same room ID are connected to the same meeting

Peer-to-Peer Connections

PeerJS server handles signaling between peers

Direct WebRTC connections for video/audio streaming

Real-time Events

Socket.io manages room membership, chat messages, and user events

Typing indicators and participant updates are broadcast instantly

Chat System

Messages are sent via Socket.io and displayed in real-time

Desktop sidebar and mobile offcanvas chat panels

⚙️ Configuration
The app uses environment variables for flexibility:

PORT - Server port (default: 3000)

For production, PeerJS automatically configures itself for HTTPS:

javascript
const peerConfig = {
    path: '/peerjs',
    host: window.location.hostname,
    port: window.location.protocol === 'https:' ? 443 : 3000,
    secure: window.location.protocol === 'https:'
};
🤝 Contributing
Contributions are welcome! Feel free to:

Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Open a Pull Request

📝 License
This project is licensed under the ISC License.

🙏 Acknowledgements
PeerJS for WebRTC simplification

Socket.io for real-time events

Font Awesome for icons

Bootstrap for UI components

📧 Contact
Project Link: https://github.com/yourusername/zoom-clone