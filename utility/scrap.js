const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


 async function scrap(url) {
    try {
       const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium-browser', // Use system Chromium
  args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Render
});
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const articles = await page.evaluate(() => {
            const articleElements = document.querySelectorAll('.crayons-story');
            const data = [];
            articleElements.forEach((article) => {
                const titleElement = article.querySelector('.crayons-story__hidden-navigation-link');
                const authorElement = article.querySelector('.crayons-story__secondary') || article.querySelector('.profile-preview-card__trigger');
                const avatarElement = article.querySelector('.crayons-avatar img');
                const dateElement = article.querySelector('time');
                const tagElement = article.querySelectorAll('.crayons-story__tags');

                const title = titleElement ? titleElement.textContent.trim() : null;
                const author = authorElement ? authorElement.textContent.trim() : null;
                const authorPicture = avatarElement ? avatarElement.src : null;
                const link = titleElement ? 'https://dev.to' + titleElement.getAttribute('href') : null;
                const date = dateElement ? dateElement.getAttribute('datetime') || dateElement.textContent.trim() : null;
               


                if (title && author) {
                    data.push({ title, author, authorPicture, link, date });
                }
            });
            return data;
        });

        await browser.close();
        return articles; // Return the scraped data
    } catch (error) {
        console.error('Error scraping:', error);
        return []; // Return an empty array on error
    }
}



 async function scrapArticle(url) {
    try {
        const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium-browser', // Use system Chromium
  args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Render
});
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract the raw HTML in the browser context
        const articleBodyHTML = await page.evaluate(() => {
            const articleBody = document.querySelector('#article-body');
            return articleBody ? articleBody.innerHTML : null;
        });

        await browser.close();

        if (articleBodyHTML) {
            // Use Cheerio in Node.js to process the HTML
            const $ = cheerio.load(articleBodyHTML);
            $('br').remove(); 
            $('svg').remove();
            $('head').append('<link rel="stylesheet" href="https://assets.dev.to/assets/views-4dd5770daa5d9d443ed73a724fb1913af9b093295bf1a72307f0fb322e5df1d9.css" media="all" id="main-views-stylesheet">')
            $('head').append('<link rel="stylesheet" href="https://assets.dev.to/assets/minimal-6206ee9219dabd8e1168cebeb1f34c12ab133f7723e45d4b24dd76b43fee1fbc.css" media="all" id="main-minimal-stylesheet">')
            $('head').append('<style>code { color: #4b9bf0; padding: 3px;}</style>')
           

            // Example of removing <br> tags
            return $.html(); // Return the processed HTML as a string
        } else {
            return null; // Return null if no article body found
        }
    } catch (err) {
        console.error('Error scraping:', err);
        return null; // Return null on error
    }
}

async function getTags() {
    try {
       const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium-browser', // Use system Chromium
  args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Render
});
        const page = await browser.newPage();
        await page.goto('https://dev.to/tags', { waitUntil: 'networkidle2', timeout: 60000 });
        
        const tags = await page.evaluate(() => {
            const tagElements = document.querySelectorAll('#main-content .grid a'); // Adjust the selector
            return Array.from(tagElements).map(tag => ({
                name: tag.textContent.trim().split('').slice(1).join(''),
                href: tag.href,
            }));
        });

        await browser.close(); // Close the browser
        return tags;
        
    }
    catch (error) {
        console.error('Error fetching tags:', error);
        return []; // Return an empty array on error
    }
}


async function getUserDetails(username) {
    let browser; // Declare browser outside the try block
    try {
        browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium-browser', // Use system Chromium
  args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Render
});
        const page = await browser.newPage();
        await page.goto(`https://dev.to/${username}/`, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract main content
        const userDetails = await page.evaluate(() => {
            const mainContent = document.querySelector('#main-content');
            return mainContent ? mainContent.innerHTML : null;
        });

        if (!userDetails) {
            throw new Error('User profile not found or page structure has changed.');
        }

        const $ = cheerio.load(userDetails);
        const user = [];
        $('.crayons-layout').each((index, element) => {
            const username = $(element).find('.crayons-title.lh-tight').text().trim();
            const userPicture = $(element).find('.crayons-avatar--3xl img').attr('src') || 'No picture available';
            const userBio = $(element).find('.profile-header__bio').text().trim() || 'No bio available';
            const address = $(element).find('.profile-header__meta__item span').eq(0).text().trim() || 'No address available';
            const joinedTime = $(element).find('.profile-header__meta__item span').eq(1).text().trim() || 'No join time available';

            if (username && userBio) {
                user.push({ username, userPicture, userBio, address, joinedTime });
            }
        });

        const posts = [];
        $('.crayons-story').each((index, element) => {
            const title = $(element).find('.crayons-story__title a').text().trim() || 'No title available';
            const author = $(element).find('.profile-preview-card button').text().split(' ').slice(0, -1).join(' ').replace(/\n/g, ' ') || 'No author available';
            const authorPicture = $(element).find('.crayons-avatar img').attr('src') || 'No picture available';
            const link = 'https://dev.to' + ($(element).find('.crayons-story__title a').attr('href') || '');
            const date = $(element).find('time').text().trim() || 'No date available';

            if (title && link) {
                posts.push({ title, author, authorPicture, link, date });
            }
        });

        return { user: user.length > 0 ? user : 'No user details available', posts: posts.length > 0 ? posts : 'No posts available' };
    } catch (e) {
        console.error('Error fetching user details:', e);
        throw e;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}






module.exports = { scrap, scrapArticle, getTags, getUserDetails }
