
const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const app = express();
const port = 3000;
const cors = require('cors');
const router = require('./Routes/scrap')


app.use(cors({
    origin: '*'
}));


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});


app.use('/', router);

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);

});












app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
