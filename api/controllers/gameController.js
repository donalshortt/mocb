import { createDecisions, transferIGN, applyScoreModifiers, duplicateYear, findNewPlayers, isNewIGN, getOrWriteDataJSON, getOldIGN, removeDecision } from '../utils/utils.js';
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

async function awaitDecisions(keys) {
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

	Promise.all(promises);
}

export async function postGameData(req, resp) {
	const path = "./data/" + req.body.id + "_game_data.json";
	const json = getOrWriteDataJSON(path);

	if (duplicateYear(json, req.body.date)) {
		console.log("Duplicate year detected");
		resp.json("Duplicate year detected");
		return;
	}

	// LEFT OFF HERE
	const new_igns = findNewPlayers(json, req.body.players);
	if (new_igns.length > 0) {
		const keys = createDecisions(req.body, new_igns);
		await awaitDecisions(keys);

		if (await isNewIGN(req.body, keys)) {



			

			transferIGN(new_igns, getOldIGN(req.body.id, key), req.body.id);
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
