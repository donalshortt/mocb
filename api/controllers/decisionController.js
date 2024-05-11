import { getOrWriteDataJSON } from '../utils/utils.js';

export function getDecisions(req, resp) {
	const path = "./data/" + req.body.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);
	resp.json(json);
}

export function decide(req, resp) {

};
