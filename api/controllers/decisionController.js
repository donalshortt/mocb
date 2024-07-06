import { getOrWriteDataJSON } from '../utils/utils.js';

export function getDecisions(req, resp) {
	const path = "./data/" + req.query.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);
	resp.json(json);
}

export function decide(req, resp) {
	const path = "./data/" + req.body.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);

	console.log('Decision incoming!');
	console.log(req.body);

	for (let decision of json) {
		if (decision.date == req.body.date && decision.ign == req.body.ign) {
			decision.decision = req.body.decision;
			return;
		}
	}

	console.log("Warning: decision not found");
};
