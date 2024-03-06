import express from 'express';
import * as gameController from '../controllers/gameController.js';

const router = express.Router();

router.get('/game_data', gameController.getGameData);
router.post('/game_data', gameController.postGameData);
router.get('/games', gameController.getGames);

export default router;
