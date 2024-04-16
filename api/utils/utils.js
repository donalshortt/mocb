import fs from 'fs';

export function applyScoreModifiers(body) {
	const modifiers_json = getDataJSON(body.id, "modifiers");

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

export function newPlayer(json, players) {
	const db_igns = json.players.map(player => player.ign);
	const req_igns = players.map(player => player.ign);

	const db_igns_sorted = db_igns.sort();
	const req_igns_sorted = req_igns.sort();
	
	for (i = 0; i < db_igns_sorted.length; i++) {
		if (db_igns_sorted[i] != req_igns_sorted[i]) {
			return req_igns_sorted[i];
		}
	}

	return false;
}

// is a decision to decide wether is new a new IGN or a new player
export function createDecision(body, new_player) {
	const json = getDataJSON(body.id, "decisions");

	let decision = {
		date: body.date,
		ign: new_player,
		decision: "undecided",
	}

	json.push(decision);
}

export async function isNewIGN(body, new_player) {
	const path = "./data/" + body.id + "_decisions.json";
	
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, "[]");
		return body;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	return new Promise((resolve) => {
		setInterval(() => {
			for (let decision of json) {
				if (decision.date == body.date && decision.ign == new_player) {
					clearInterval(intervalID);
					switch (decision.decision) {
						case "undecided":
							break;
						case "newIgn":
							resolve(true);
							break;
						case "newPlayer":
							resolve(false);
							break;
					};
				}
			}
		}, 5000);
	})

}

export function transferData() {
	console.log("Transferring!");
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
