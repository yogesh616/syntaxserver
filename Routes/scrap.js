const express = require('express');
const router = express.Router();
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const { scrap, scrapArticle, getTags, getUserDetails } = require('../utility/scrap')

router.get('/search', async (req, res) => {
    try {
        const prompt = req.query.prompt;
        if (!prompt) return res.status(400).json({ message: 'Please enter a search term' });

        // Check if the prompt already exists in the cache
        const cachedData = myCache.get(prompt);
        if (cachedData) {
            console.log('Serving from cache');
            return res.json({ length: cachedData.length, articles: cachedData });
        }

        // Fetch new data and cache it
        console.log('Fetching new data');
        const searchUrl = `https://dev.to/search?q=${encodeURIComponent(prompt)}}`;
        const articles = await scrap(searchUrl);
        if (articles && articles.length > 0) {
            myCache.set(prompt, articles); // Store indefinitely
            return res.json({ length: articles.length, articles });
        } else {
            res.status(404).json({ message: 'No articles found' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/article', async (req, res) => {
    try {
        const articleUrl = req.query.url;
        if (!articleUrl) return res.status(400).json({ message: 'Please provide an article URL' });

        // Check if the URL is cached
        const cachedArticle = myCache.get(articleUrl);
        if (cachedArticle) {
            console.log('Serving cached article');
            return res.json({ data: cachedArticle });
        }

        // Fetch new article and cache it
        console.log('Fetching new article');
        const scrapedData = await scrapArticle(articleUrl);
        if (scrapedData) {
            myCache.set(articleUrl, scrapedData); // Store indefinitely
            res.json({ data: scrapedData });
            
        } else {
            res.status(404).json({ message: 'No article found' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/tags', async (req, res) => {
    try {
        const cachedTags = myCache.get('tags');
        if (cachedTags) {
            console.log('Serving cached tags');
            return res.json({ tags: cachedTags });
        }

        const tags = await getTags();
        myCache.set('tags', tags);
        res.json( tags );
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


router.get('/username', async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const cachedUser = myCache.get(username);
        if (cachedUser) {
            console.log('Serving cached user data');
            return res.json(cachedUser);
        }


        const data = await getUserDetails(username);
        if (data) {
            myCache.set(username, data); // Store indefinitely
            return res.json(data);
        }
        
    }
    catch (e) {
        console.error('Error handling request:', e);
        res.status(500).json({ message: 'Internal Server Error' });
    }

});


module.exports = router;