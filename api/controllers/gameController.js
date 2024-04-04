import { applyScoreModifiers, checkIfDuplicateYear } from '../utils/utils.js';
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

export function postGameData(req, resp) {
	const path = "./data/" + req.body.id + "_game_data.json";

	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify([req.body]));
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());
	
	if (duplicateYear(json, req.body.date)) {
		console.log("Duplicate year detected");
		resp.json("Duplicate year detected");
		return;
	}

	if (newPlayer(json, req.body.players)) {
		console.log("New player detected");
		// TODO: START HERE
		create_decision(req.body);
	} else {
		transferData();
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
