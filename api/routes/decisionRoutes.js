import express from 'express';
import * as decisionController from '../controllers/decisionController.js';

const router = express.Router();

router.get('/decisions', decisionController.getDecisions);
router.post('/decide', decisionController.decide);

export default router;
