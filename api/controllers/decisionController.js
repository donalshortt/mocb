import { getOrWriteDataJSON } from '../utils/utils.js';
import fs from 'fs';

export function getDecisions(req, resp) {
	const path = "./data/" + req.query.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);
	resp.json(json);
}

export function decide(req, resp) {
	const path = "./data/" + req.body.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);

	for (let decision of json) {
		if (decision.key == req.body.key) {
			console.log("Decision found");
			decision.decision = req.body.decision;
			fs.writeFileSync(path, JSON.stringify(json));
			return;
		}
	}

	console.log("Warning: decision not found");
};
