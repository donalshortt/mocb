import { getOrWriteDataJSON } from '../utils/utils.js';

export function getDecisions(req, resp) {
	const path = "./data/" + req.query.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);
	resp.json(json);
}

export function decide(req, resp) {
	const path = "./data/" + req.body.id + "_decisions.json";
	const json = getOrWriteDataJSON(path);

	for (let decision of json) {
		if (decision.date == req.body.date && decision.ign == req.body.ign) {
//			switch (req.body.)
		}
	}
};
