const express = require('express')
const app = express()

app.use("/", express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

const port = process.env.PORT || port
app.listen(port, () => {
    console.log(`app running on port: ${port}`)
})