const express = require('express')
const app = express()

var https = require('https');
var http = require('http');
var fs = require('fs');

var options = {
    key: fs.readFileSync('certificate/key.pem'),
    cert: fs.readFileSync('certificate/cert.pem')
};

app.use("/", express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

const port = process.env.PORT || 1200

https.createServer(options, app).listen(port, () => {
    console.log("App running on port: ", port)
});