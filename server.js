const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors'); // Import cors

const app = express();
const PORT = process.env.PORT || 3000;

const puppeteer = require('puppeteer-core');

const browser = await puppeteer.launch({ 
  headless: true,
  executablePath: await puppeteer.executablePath()
});


// Middleware
app.use(cors({
  origin: 'https://uzdik.github.io'
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Routes
app.post('/submit-code', async (req, res) => {
    const { username, password, problemUrl, code } = req.body;

    try {
        // Launch Puppeteer browser
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to Codeforces login page
        await page.goto('https://codeforces.com/enter');

        // Login to Codeforces
        await page.type('#handleOrEmail', username);
        await page.type('#password', password);
        await page.click('.submit');

        // Wait for login success
        await page.waitForNavigation();

        // Navigate to problem URL
        await page.goto(problemUrl);

        // Paste code into submission form
        await page.type('textarea#sourceCodeTextarea', code);

        // Submit code
        await page.click('input[value="Submit"]');

        // Wait for submission result
        await page.waitForNavigation();

        // Close browser
        await browser.close();

        // Send response
        res.status(200).send('Code submitted successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting code.');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
