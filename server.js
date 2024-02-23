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

function applyScoreModifiers(body) {
	const path = "./data/" + body.id + "_modifiers.json";
	
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, "[]");
		return body;
	}

	const modifiers = fs.readFileSync(path);
	const modifiers_json = JSON.parse(modifiers.toString());

	for (player of body.players) {
		let modified_score = player.score;

		for (entry of modifiers_json) {
			if (entry.tag != player.tag) { continue; }

			for (modifier of entry.modifiers) {
				let value = Object.values(modifier).toString();
				if (value[0] == "+") {
					value = value.replace ("+", "1.");
					modified_score *= parseFloat(value);
					modified_score = Math.round(modified_score);
				} else {
					value = value.replace("-", "0.");
					value = 1.0 - parseFloat(value);
					modified_score *= value;
					modified_score = Math.round(modified_score);
				}
			}
		}

		player.score = modified_score;
	}
	return body;
}

// HACK: we do this cause i can't find a nice way in vue to choose the last element of the list of player igns
function inversePlayerIgns(body) {
	for (player of body.players) {
		player.igns = player.igns.reverse(); 
	}

	return body;
}

function checkIfDuplicateYear(json, date) {
	console.log(date);
	for (let i = 0; i < json.length; i++) {
		if (json[i].date == date) {
			return true;
		}
	}
	return false;
}

app.post('/api/game_data', (req,resp) => {
	const path = "./data/" + req.body.id + "_game_data.json";

	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify([req.body]));
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());
	
	if (checkIfDuplicateYear(json, req.body.date)) {
		console.log("Duplicate year detected");
		resp.json("Duplicate year detected");
		return;
	}

	console.log(`Game data recieved! \n {req.body}`);

	req.body = applyScoreModifiers(req.body);
	req.body = inversePlayerIgns(req.body);

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

	let player = json.find(obj => obj.tag === req.body.tag);

	if (player) {
		player.modifiers.push(req.body.modifier);
	} else {
		json.push({
			"tag": req.body.tag,
			"modifiers": [req.body.modifier]
		});
	}

	fs.writeFileSync(path, JSON.stringify(json));

	resp.json("modifier recieved");
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

	resp.json("modifier data not found");
})

app.delete('/api/modifier', (req, resp) => {
	const path = "./data/" + req.query.id + "_modifiers.json";

	if (!fs.existsSync(path)) { 
		resp.json("file not found");
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	for (var player of json) {
    	if (player.tag == req.query.tag) {
        	const index = player.modifiers.findIndex(modifier => {
            	const [[key, value]] = Object.entries(modifier);
            	return key == req.query.key && value == parseInt(req.query.value, 10);
        	});
        	if (index > -1) {
				// Splice the array to remove the item
				player.modifiers.splice(index, 1);

				// Write the updated json back to the file
				fs.writeFileSync(path, JSON.stringify(json));

				// Send a response to the client
				resp.json("modifier removed");
				return;
        	}
    	}
	}

	resp.json("modifier data not found");
})

app.delete('/api/player', (req, resp) => {
	const gamedata_path = "./data/" + req.query.id + "_game_data.json";
	const modifier_path = "./data/" + req.query.id + "_modifiers.json";
})

app.listen(port, () => {
	// TODO: maybe not the right place to put initialization code
	const dataPath = "./data";

	fs.mkdir(dataPath, (err) => {
		if (err) {
			console.log("Data directory already exists");
		} else {
			console.log("Data directory created");
		}
	});

	console.log(`server listening on port: ${port}`);
});
