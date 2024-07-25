import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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
	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	for (let decision of json) {
		if (decision.key === key) {
			return decision.old_ign;
		}
	}

	console.log("Warning: old ign not found");
	return null;
}
