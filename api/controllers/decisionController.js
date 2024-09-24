import { getOrWriteDataJSON } from '../utils/utils.js';
import fs from 'fs';

export function getDecisions(req, resp) {
	const path = "./data/" + req.query.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);
	resp.json(json);
}

export function decide(req, _resp) {
	const path = "./data/" + req.body.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);

	console.log(req.body);

	for (let decision of json) {
		if (decision.key === req.body.key) {
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
