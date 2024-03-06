const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const gameRoutes = require('./api/routes/gameRoutes');
const playerRoutes = require('./api/routes/playerRoutes');
const modifierRoutes = require('./api/routes/modifierRoutes');

const app = express();
const port = process.env.PORT || 3080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../front/build')));
app.use(cors());

// Initialize data directory
require('./api/utils/fileUtils').initDataDir();

// Routes
app.use('/api', gameRoutes);
app.use('/api', playerRoutes);
app.use('/api', modifierRoutes);

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});
