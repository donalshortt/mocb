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
		console.log(decision.key);
		console.log(req.body.key);
		if (decision.key == req.body.key) {
			decision.decision = req.body.decision;

			if (req.body.decision == "newIGN") {
				decision.old_ign = req.body.old_ign;
			}

			fs.writeFileSync(path, JSON.stringify(json));
			return;
		}
	}

	console.log("Warning: decision not found");
};
