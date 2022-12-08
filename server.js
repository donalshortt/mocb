const express = require('express');
const path = require('path');
const app = express(),
	bodyParser = require('body-parser');
const cors = require('cors');

port = process.env.PORT || 3080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../front/build')));
//TODO: tighten this to allow only the frontend... when we know what port it'll be running on
app.use(cors())

let toy_database = [{"wow": "wee"}];

app.post('/api/game_data', (req,resp) => {
	resp.json("game data recieved");
	toy_database.push(req.body);
	console.log("game data recieved");
	console.log(toy_database);
});

app.get('/api/game_data', (req, resp) => {
	resp.json(toy_database[toy_database.length - 1]);
	console.log("game data sent");
});

app.listen(port, () => {
	console.log(`server listening on port: ${port}`);
});
