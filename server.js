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

// loop over all the players in players
// for each player, get their current score
// find the modifiers associated with said score
// apply them to the score
// replace score with modified score
function applyScoreModifiers(body) {
	const path = "./data/" + body.id + "_modifiers.json";
	const modifiers = fs.readFileSync(path);
	const modifiers_json = JSON.parse(modifiers.toString());

	for (player of body.players) {
		for (modifier of modifiers_json) {
			if (modifier.tag == player.tag) {
				console.log("Match!");
				console.log(modifier.tag);
			}
		}
		console.log(player);
	}

	return body;
}

app.post('/api/game_data', (req,resp) => {
	const path = "./data/" + req.body.id + "_game_data.json";
	
	req.body = applyScoreModifiers(req.body);

	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify([req.body]));
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	json.push(req.body);

	fs.writeFileSync(path, JSON.stringify(json));
});

app.get('/api/game_data', (req, resp) => {
	const files = fs.readdirSync("./data");
	
	for (let i = 0; i < files.length; i++) {
		if(files[i] == (req.query.id + "_game_data.json")) {
			const file = fs.readFileSync("./data/" + files[i]);
			const json = JSON.parse(file.toString());

			resp.json(json[json.length - 1]);
			break;
		}
	}
});

app.get('/api/games', (req, resp) => {
	const files = fs.readdirSync("./data");
	let games = [];

	for (let i = 0; i < files.length; i++) {
		if (files[i].endsWith("_game_data.json")) {
			const file = fs.readFileSync("./data/" + files[i]);
			const json = JSON.parse(file.toString());

			const name = json[json.length - 1].name;
			const id = json[json.length - 1].id;
			games.push({name, id});
		}
	}

	resp.json(games);
});

function tagExists(json, tag) {
	for (var player of json) {
		if (player.tag == tag) {
			return true;
		}
	}

	return false;
}

app.post('/api/modifier', (req,resp) => {
	const path = "./data/" + req.body.id + "_modifiers.json";

	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify(
			[{ "tag": req.body.tag, "modifiers": [req.body.modifier] }]
		));

		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	if (!tagExists(json, req.body.tag)) {
		json.push({ "tag": req.body.tag, "modifiers": [req.body.modifier] });
	} else {
		for (var player of json) {
			if (player.tag == req.body.tag) {
				player.modifiers.push(req.body.modifier);
			}
		}
	}

	fs.writeFileSync(path, JSON.stringify(json));
})

app.get('/api/modifiers', (req, resp) => {
	const path = "./data/" + req.query.id + "_modifiers.json";

	if (!fs.existsSync(path)) { 
		resp.json("file not found");
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	for (var player of json) {
		if (player.tag == req.query.tag) {
			resp.json(player.modifiers);
			return;
		}
	}
})

app.listen(port, () => {
	console.log(`server listening on port: ${port}`);
});
