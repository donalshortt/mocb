import fs from 'fs';
import { getOrWriteDataJSON, getDataJSON } from '../utils/utils.js';

export function postModifier(req, resp) {
	const path = "./data/" + req.body.id + "_modifiers.json";
	const json = getOrWriteDataJSON(path);

	let player = json.find(obj => obj.ign === req.body.ign);

	if (player) {
		player.modifiers.push(req.body.modifier);
	} else {
		json.push({
			"ign": req.body.ign,
			"modifiers": [req.body.modifier]
		});
	}

	fs.writeFileSync(path, JSON.stringify(json));

	resp.json("modifier recieved");
};

export function deleteModifier(req, resp) {
	const path = "./data/" + req.query.id + "_modifiers.json";
	const json = getDataJSON(path);

	if (json == null) {
		resp.json("file not found");
		return;
	}

	for (var player of json) {
    	if (player.ign == req.query.ign) {
        	const index = player.modifiers.findIndex(modifier => {
            	const [[key, value]] = Object.entries(modifier);
            	return key == req.query.key && value == parseInt(req.query.value, 10);
        	});
        	if (index > -1) {
				// Splice the array to remove the item
				player.modifiers.splice(index, 1);

				// Write the updated json back to the file
				fs.writeFileSync(path, JSON.stringify(json));

				// Send a response to the client
				resp.json("modifier removed");
				return;
        	}
    	}
	}

	resp.json("modifier data not found");
};

export function getModifiers(req, resp) {
	const path = "./data/" + req.query.id + "_modifiers.json";
	console.log
	const json = getDataJSON(path);

	if (json == null) {
		resp.json("file not found");
		return;
	}

	for (var player of json) {
		if (player.ign == req.query.ign) {
			resp.json(player.modifiers);
			return;
		}
	}

	resp.json("modifier data not found");
};
