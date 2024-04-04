import express from 'express';
import * as decisionController from '../controllers/decisionController.js';

const router = express.Router();

router.get('/decisions', decisionController.getDecisions);

export default router;