import fs from 'fs';

export function applyScoreModifiers(body) {
	const path = "./data/" + body.id + "_modifiers.json";
	
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, "[]");
		return body;
	}

	const modifiers = fs.readFileSync(path);
	const modifiers_json = JSON.parse(modifiers.toString());

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

// first need to detect if a new player ign is detected
// then need to send question to admin
// depending on response.. do the dance

export function newPlayer(json, players) {
	const db_igns = json.players.map(player => player.ign);
	const req_igns = players.map(player => player.ign);

	const db_igns_sorted = db_igns.sort();
	const req_igns_sorted = req_igns.sort();
	
	if (db_igns_sorted.length != req_igns_sorted.length) {
		return true;
	}

	for (i = 0; i < db_igns_sorted.length; i++) {
		if (db_igns_sorted[i] != req_igns_sorted[i]) {
			return true;
		}
	}

	return false;
}

export function createDecision() {
	const path = "./data/" + body.id + "_decisions.json";
	
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, "[]");
		return body;
	}

	const decisions = fs.readFileSync(path);
	const decisions_json = JSON.parse(modifiers.toString());


}

export function transferData() {
	console.log("Transferring!");
}
