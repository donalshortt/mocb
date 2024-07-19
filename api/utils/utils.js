import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export function applyScoreModifiers(body) {
	const path = "./data/" + body.id + "_modifiers.json";
	const modifiers_json = getOrWriteDataJSON(path);

	for (let player of body.players) {
		let modified_score = player.score;

		for (let entry of modifiers_json) {
			if (entry.ign != player.ign) { continue; }

			for (let modifier of entry.modifiers) {
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

export function duplicateYear(json, date) {
	console.log(date);
	for (let i = 0; i < json.length; i++) {
		if (json[i].date == date) {
			return true;
		}
	}
	return false;
}

export function initDataDir() {
	const dataPath = "./data";

	fs.mkdir(dataPath, (err) => {
		if (err) {
			console.log("Data directory already exists");
		} else {
			console.log("Data directory created");
		}
	});
}

export function findNewPlayer(json, players) {
	if (json.length == 0) {
		return false;
	}

	const db_igns = json[json.length - 1].players.map(player => player.ign);
	const req_igns = players.map(player => player.ign);

	for (let i = 0; i < req_igns.length; i++) {
		for (let j = 0; j < req_igns.length; j++) {
			if (req_igns[i] == db_igns[j]) { break; }

			if (j == req_igns.length - 1) {
				return req_igns[i];
			}
		}
	}

	return false;
}

// is a decision to decide wether is a new IGN or a new player
// TODO: generalise this function (as the name implies)
export function createDecision(body, new_player) {
	const path = "./data/" + body.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);

	let decision = {
		key: uuidv4(),
		ign: new_player,
		old_ign: null,
		question: "New player detected",
		options: ["New Player", "New IGN"],
		decision: "undecided"
	}

	json.push(decision);
	fs.writeFileSync(path, JSON.stringify(json));

	return decision.key;
}

export async function isNewIGN(body, key) {
	const path = "./data/" + body.id + "_decisions.json";
	
	console.log("waiting for decision");

	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, "[]");
		return body;
	}

	return new Promise((resolve) => {
		let intervalID = setInterval(() => {
			const file = fs.readFileSync(path);
			const json = JSON.parse(file.toString());

			for (let decision of json) {
				if (decision.key === key) {
					switch (decision.decision) {
						case "undecided":
							break;
						case "newIGN":
							clearInterval(intervalID);
							resolve(true);
							break;
						case "newPlayer":
							clearInterval(intervalID);
							resolve(false);
							break;
					};
				} else {
					console.log("Not equal??")
				}
			}
		}, 5000);
	})
}

export function transferIGN(new_ign, old_ign, id) {
	const mod_path = "./data/" + id + "_modifiers.json";
	const game_path = "./data/" + id + "_game_data.json";

	const mod_json = getDataJSON(mod_path);
	const game_json = getDataJSON(game_path);

	const mod_string = JSON.stringify(mod_json);
	const game_string = JSON.stringify(game_json);

	console.log("mod_string: " + mod_string);

	console.log("============================")
	console.log("============================")
	console.log("============================")
	console.log(old_ign, new_ign);
	mod_string.replace(old_ign, new_ign);
	console.log("mod_string: " + mod_string);


	console.log("game_string: " + game_string);

	console.log("============================")
	console.log("============================")
	console.log("============================")
	console.log(old_ign, new_ign);
	game_string.replace(old_ign, new_ign);
	console.log("game_string: " + game_string);


	fs.writeFileSync(mod_path, mod_string);
	fs.writeFileSync(game_path, game_string);
}

export function removeDecision(id, key) {
	const path = "./data/" + id + "_modifiers.json";
	let json = getDataJSON(path);

	for (let decision of json) {
		if (decision.key === key) {
			console.log("removing decision");
			json.splice(json.indexOf(decision), 1);
		}
	}

	fs.writeFileSync(path, JSON.stringify(json));
}

export function getDataJSON(path) {
	if (!fs.existsSync(path)) {
		return null;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());
	
	return json;
}

export function getOrWriteDataJSON(path) {
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify([]));
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());
	
	return json;
}

export function getOldIGN(id, key) {
	const path = "./data/" + id + "_decisions.json";
	
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, "[]");
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	for (let decision of json) {
		if (decision.key == key) {
			return decision.old_ign;
		}
	}

	console.log("Warning: old ign not found");
	return null;
}
