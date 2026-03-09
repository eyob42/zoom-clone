const express = require("express");
const { Server } = require("http");
const app = express();


const server = require("http").Server(app);
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('room')
})



server.listen(process.env.PORT || 3000);