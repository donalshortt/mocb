import { getDataJSON, getOrWriteDataJSON } from '../utils/utils.js';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export function getGameData(req, resp) {
	const files = fs.readdirSync("./data");

	for (let i = 0; i < files.length; i++) {
		if(files[i] == (req.query.id + "_game_data.json")) {
			const file = fs.readFileSync("./data/" + files[i]);
			const json = JSON.parse(file.toString());

			resp.json(json[json.length - 1]);
			break;
		}
	}
};

async function awaitDecisions(keys, id) {
	const path = "./data/" + id + "_decisions.json";
	let promises = [];

	for (let key of keys) {
		promises.push(new Promise((resolve) => {
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
								resolve();
								break;
							case "newPlayer":
								clearInterval(intervalID);
								resolve();
								break;
						};
					}
				}
			}, 1000);
		}))
	}

	await Promise.all(promises);
}

function getDataTransferCandidates(id) {
	const path = "./data/" + id + "_decisions.json";
	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	let transfer_candidates = [];

	for (let decision of json) {
		if (decision.decision === "newIGN") {
			transfer_candidates.push([decision.old_ign, decision.ign]);
		}
	}

	return transfer_candidates;
}

function findNewPlayers(json, players) {
	if (json.length == 0) {
		return false;
	}

	let results = [];

	const db_igns = json[json.length - 1].players.map(player => player.ign);
	const req_igns = players.map(player => player.ign);

	for (let i = 0; i < req_igns.length; i++) {
		for (let j = 0; j < req_igns.length; j++) {
			if (req_igns[i] == db_igns[j]) { break; }

			if (j == req_igns.length - 1) {
				results.push(req_igns[i]);
			}
		}
	}

	return results;
}

// is a decision to decide wether is a new IGN or a new player
// TODO: generalise this function (as the name implies)
function createDecisions(body, new_players) {
	const path = "./data/" + body.id + "_decisions.json";
	let json = getOrWriteDataJSON(path);
	let keys = [];

	for (let new_player of new_players) {
		let decision = {
			key: uuidv4(),
			ign: new_player,
			old_ign: null,
			question: "New player detected",
			options: ["New Player", "New IGN"],
			decision: "undecided"
		}

		json.push(decision);
		keys.push(decision.key);
	}


	fs.writeFileSync(path, JSON.stringify(json));
	fs.readFileSync(path);

	return keys;
}

function transferIGNs(candidates, id) {
	const mod_path = "./data/" + id + "_modifiers.json";
	const game_path = "./data/" + id + "_game_data.json";

	const mod_json = getDataJSON(mod_path);
	const game_json = getDataJSON(game_path);

	let mod_string = JSON.stringify(mod_json);
	let game_string = JSON.stringify(game_json);

	for (let [old_ign, new_ign] of candidates) {
		const regex = new RegExp(old_ign, "g");
		mod_string = mod_string.replace(regex, new_ign);
		game_string = game_string.replace(regex, new_ign);
	}

	fs.writeFileSync(mod_path, mod_string);
	fs.writeFileSync(game_path, game_string);
}

function removeDecisions(id) {
	const path = "./data/" + id + "_decisions.json";
	fs.writeFileSync(path, JSON.stringify([]));
}

function applyScoreModifiers(body) {
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

function duplicateYear(json, date) {
	for (let i = 0; i < json.length; i++) {
		if (json[i].date == date) {
			return true;
		}
	}
	return false;
}

export async function postGameData(req, resp) {
	const path = "./data/" + req.body.id + "_game_data.json";
	const json = getOrWriteDataJSON(path);

	if (duplicateYear(json, req.body.date)) {
		console.log("Duplicate year detected");
		resp.json("Duplicate year detected");
		return;
	}

	const new_igns = findNewPlayers(json, req.body.players);
	if (new_igns.length > 0) {
		const keys = createDecisions(req.body, new_igns);
		await awaitDecisions(keys, req.body.id);

		const transfer_data_candidates = getDataTransferCandidates(req.body.id);
		if (transfer_data_candidates.length > 0) {
			transferIGNs(transfer_data_candidates, req.body.id);
		}
	}

	console.log(`Game data recieved!`);

	// TODO: might be able to just empty the decisions file of everything
	removeDecisions(req.body.id);

	req.body = applyScoreModifiers(req.body);
	json.push(req.body);
	fs.writeFileSync(path, JSON.stringify(json));
};

export function getGames(_req, resp) {
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
}
