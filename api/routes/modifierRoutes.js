import express from 'express';
import * as modifierController from '../controllers/modifierController.js';

const router = express.Router();

router.post('/modifier', modifierController.postModifier);
router.delete('/modifier', modifierController.deleteModifier);
router.get('/modifiers', modifierController.getModifiers);

export default router;
