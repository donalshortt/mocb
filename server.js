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

// we do this cause i can't find a nice way in vue to choose the last element of the list of player igns
function inversePlayerIgns(body) {
	for (player of body.players) {
		player.igns = player.igns.reverse(); 
	}

	return body;
}

app.post('/api/game_data', (req,resp) => {
	const path = "./data/" + req.body.id + "_game_data.json";

	req.body = applyScoreModifiers(req.body);
	req.body = inversePlayerIgns(req.body);

	console.log(`Game data recieved! \n {req.body}`);

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

	resp.json("modifier data not found");
})

app.delete('/api/modifier', (req, resp) => {
	// get the modifier based on a tag, ID, name and value.
	// remove it from wherever its stored.
		
	console.log(`ID: ${req.query.id}`);
	console.log(`tag: ${req.query.tag}`);
	console.log(`key: ${req.query.key}`);
	console.log(`value: ${req.query.value}`);

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

app.listen(port, () => {
	console.log(`server listening on port: ${port}`);
});
