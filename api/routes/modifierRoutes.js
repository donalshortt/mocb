const express = require('express');
const router = express.Router();
const modifierController = require('../controllers/modifierController');

router.post('/modifier', modifierController.postModifier);
router.delete('/modifier', modifierController.deleteModifier);
router.get('/modifiers', modifierController.getModifiers);

module.exports = router;
