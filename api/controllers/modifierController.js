import fs from 'fs';

export function postModifier(req, resp) {
	const path = "./data/" + req.body.id + "_modifiers.json";

	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify(
			[{ "tag": req.body.tag, "modifiers": [req.body.modifier] }]
		));

		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	let player = json.find(obj => obj.tag === req.body.tag);

	if (player) {
		player.modifiers.push(req.body.modifier);
	} else {
		json.push({
			"tag": req.body.tag,
			"modifiers": [req.body.modifier]
		});
	}

	fs.writeFileSync(path, JSON.stringify(json));

	resp.json("modifier recieved");
};

export function deleteModifier(req, resp) {
	const path = "./data/" + req.query.id + "_modifiers.json";

	if (!fs.existsSync(path)) { 
		resp.json("file not found");
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	for (var player of json) {
    	if (player.tag == req.query.tag) {
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

	if (!fs.existsSync(path)) { 
		resp.json("file not found");
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());

	for (var player of json) {
		if (player.tag == req.query.tag) {
			resp.json(player.modifiers);
			return;
		}
	}

	resp.json("modifier data not found");
};
