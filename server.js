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

// {
// 	tag: TAG
// 	modifiers: [
// 	[],[]...
// 	]
// }


// find the file
// if file doesn't exist, create it
// parse the file into json
// if tag doesn't exist, add it
// add a modifer for the specific tag
// serialise the json
// save to file
app.post('/api/modifier', (req,resp) => {
	const path = "./data/" + req.body.id + "_modifiers.json";
	
	console.log(req.body);

	if (fs.existsSync(path)) {
		const file = fs.readFileSync(`./data/${req.body.id}_modifiers.json`);
		const json = JSON.parse(file.toString());

		console.log(req.body.tag);
		if (!json.includes(req.body.tag)) {
			json.push({ "tag": req.body.tag, "modifiers": req.body.modifiers });
			console.log("not included");
		} else {
			console.log("included");
			for (let player in json) {
				if (player.tag == req.body.tag) {
					json.player.modifiers.push(req.body.modifiers);
				}
			}
		}

		fs.writeFileSync(`./data/${req.body.id}_modifiers.json`, JSON.stringify(json));
	} else {
		fs.writeFileSync(`./data/${req.body.id}_modifiers.json`, JSON.stringify(
		[{"tag": req.body.tag, "modifiers": req.body.modifiers}]
		));
	}

	console.log(`modifier ${req.body.modifiers} added to ${req.body.tag}`)
})


app.listen(port, () => {
	console.log(`server listening on port: ${port}`);
});
