import fs from 'fs'

let toy_database = [{"wow": "wee"}];

app.post('/api/game_data', (req,resp) => {
	console.log(`Game ID recieved ${req.body.id}`);
	
	const path = "../data/" + req.body.id;
	if (fs.existsSync(path)) {
		console.log('i exist!');
	} else {
		console.log('i no exist');
	}

	resp.json("game data recieved");
	toy_database.push(req.body);
	console.log("game data recieved");
	console.log(toy_database);
});

app.get('/api/game_data/date', (req, resp) => {
	
});

app.get('/api/game_data/id', (req, resp) => {

});

app.get('/api/game_data/players', (req, resp) => {

});

app.get('/api/game_data', (req, resp) => {
	resp.json(toy_database[toy_database.length - 1]);
	console.log("game data sent");
});

