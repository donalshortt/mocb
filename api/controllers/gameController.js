const utils = require('../utils/utils');

router.get('/game_data', gameController.getGameData);
router.post('/game_data', gameController.postGameData);
router.get('/games', gameController.getGames);

exports.getGameData = (req, resp) => {
	const files = fs.readdirSync("./data");
	
	for (let i = 0; i < files.length; i++) {
		if(files[i] == (req.query.id + "_game_data.json")) {
			const file = fs.readFileSync("./data/" + files[i]);
			const json = JSON.parse(file.toString());

			resp.json(json[json.length - 1]);
			break;
		}
	}
};

exports.postGameData = (req, resp) => {
	const path = "./data/" + req.body.id + "_game_data.json";

	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify([req.body]));
		return;
	}

	const file = fs.readFileSync(path);
	const json = JSON.parse(file.toString());
	
	if (checkIfDuplicateYear(json, req.body.date)) {
		console.log("Duplicate year detected");
		resp.json("Duplicate year detected");
		return;
	}

	console.log(`Game data recieved! \n {req.body}`);

	req.body = applyScoreModifiers(req.body);
	req.body = inversePlayerIgns(req.body);

	json.push(req.body);

	fs.writeFileSync(path, JSON.stringify(json));
};

exports.getGames = (req, resp) => {
	
}
