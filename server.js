var express = require('express'),
    app = express()

app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/generate', function (req, res) {
    res.sendFile(__dirname + '/images.html');
});
app.listen(5000);
console.log("Listening on port 5000");