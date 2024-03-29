import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import gameRoutes from './api/routes/gameRoutes.js';
import modifierRoutes from './api/routes/modifierRoutes.js';
import { initDataDir } from './api/utils/utils.js';

const app = express();
const port = process.env.PORT || 8080;

// For __dirname in ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../front/build')));
app.use(cors());

// Initialize data directory
initDataDir();

// Routes
app.use('/api', gameRoutes);
app.use('/api', modifierRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port: ${port}`);
});
