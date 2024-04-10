import fs from 'fs';
import { getOrWriteDataJSON } from '../utils/utils';

export function postModifier(req, resp) {
	const json = getOrWriteDataJSON(req.query.id, "modifiers");

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
	const json = getdataJSON(req.query.id, "modifiers");

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
	const json = getdataJSON(req.query.id, "modifiers");

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
