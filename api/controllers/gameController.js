import { createDecision, transferIGN, applyScoreModifiers, duplicateYear, findNewPlayer, isNewIGN, getOrWriteDataJSON, getOldIGN, removeDecision } from '../utils/utils.js';
import fs from 'fs';

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

export async function postGameData(req, resp) {
	const path = "./data/" + req.body.id + "_game_data.json";
	const json = getOrWriteDataJSON(path);

	if (duplicateYear(json, req.body.date)) {
		console.log("Duplicate year detected");
		resp.json("Duplicate year detected");
		return;
	}

	const new_ign = findNewPlayer(json, req.body.players);
	if (new_ign) {
		const key = createDecision(req.body, new_ign);
		if (await isNewIGN(req.body, key)) {
			transferIGN(new_ign, getOldIGN(req.body.id, key), req.body.id);
			removeDecision(req.body.id, key);
		}
	}

	console.log(`Game data recieved!`);

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
