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
			if (entry.tag != player.tag) { continue; }

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

// HACK: we do this cause i can't find a nice way in vue to choose the last element of the list of player igns
export function inversePlayerIgns(body) {
	for (let player of body.players) {
		player.igns = player.igns.reverse(); 
	}

	return body;
}

export function checkIfDuplicateYear(json, date) {
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
