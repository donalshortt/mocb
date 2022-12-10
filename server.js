const fs = require('fs');
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

app.post('/api/game_data', (req,resp) => {
	const path = "./data/" + req.body.id + "_game_data.json";
	if (fs.existsSync(path)) {
		const file = fs.readFileSync(`./data/${req.body.id}_game_data.json`);
		const json = JSON.parse(file.toString());

		json.push(req.body);
		fs.writeFileSync(`./data/${req.body.id}_game_data.json`, JSON.stringify(json));
	} else {
		fs.writeFileSync(`./data/${req.body.id}_game_data.json`, JSON.stringify([req.body]));
	}

	resp.json("game data recieved");
	console.log("game data recieved");
});

// get id
// match id to filename in data
// return said file
app.get('/api/game_data', (req, resp) => {
	console.log("GET /api/game_data");
	const files = fs.readdirSync("./data");
	
	for (let i = 0; i < files.length; i++) {
		if(files[i] == (req.body.id + "_game_data.json")) {
			const file = fs.readFileSync("./data/" + files[i]);
			const json = JSON.parse(file.toString());

			resp.json(json[json.length - 1]);
			break;
		}
	}


});

app.get('/api/games', (req, resp) => {
	console.log("GET /api/games");
	const files = fs.readdirSync("./data");
	let games = [];

	for (let i = 0; i < files.length; i++) {
		if (files[i].endsWith("_game_data.json")) {
			const file = fs.readFileSync("./data/" + files[i]);
			const json = JSON.parse(file.toString());

			let name = json[json.length - 1].name;
			let id = json[json.length - 1].id;
			games.push({name, id});
		}
	}

	resp.json(games);
});


app.listen(port, () => {
	console.log(`server listening on port: ${port}`);
});
