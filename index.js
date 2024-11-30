const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cors = require('cors');
const router = require('./Routes/scrap');
const port = 3000;

const app = express();

app.use(cors({ origin: '*' }));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.use('/', router);

app.get('/', (req, res) => {
    res.json({message: 'server is running'});
});

// Export the app instead of listening
app.listen(port, () => console.log(`server is running on port ${port}`);
