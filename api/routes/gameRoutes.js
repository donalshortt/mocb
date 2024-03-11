const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/game_data', gameController.getGameData);
router.post('/game_data', gameController.postGameData);
router.get('/games', gameController.getGames);

module.exports = router;
