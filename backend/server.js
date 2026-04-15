const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatRoutes = require('./src/routes/chatRoutes');
const logger = require('./src/utils/logger');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

app.use('/api', chatRoutes);

app.listen(PORT, () => {
    logger.info('--------------------------------------------------');
    logger.info(`🚀 Sakoon Backend started on port ${PORT}`);
    logger.info(`📅 Date: ${new Date().toLocaleString()}`);
    logger.info('--------------------------------------------------');
});
