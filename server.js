const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://uzdik.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Endpoint to handle submission
app.post('/submit', async (req, res) => {
    const { handleOrEmail, password, problemIndex, programTypeId, sourceFileContent, contestId } = req.body;

    try {
        // Step 1: Log in to Codeforces to get the CSRF token and cookies
        const loginResponse = await axios.get('https://codeforces.com/enter');
        const $ = cheerio.load(loginResponse.data);
        const csrfToken = $('meta[name="X-Csrf-Token"]').attr('content');
        
        if (!csrfToken) {
            throw new Error('Unable to retrieve CSRF token');
        }

        const cookies = loginResponse.headers['set-cookie'].join('; ');

        // Step 2: Authenticate the user
        await axios.post('https://codeforces.com/enter', {
            handleOrEmail,
            password,
            csrf_token: csrfToken
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies
            }
        });

        // Step 3: Submit the solution
        const submitResponse = await axios.post(`https://codeforces.com/contest/${contestId}/submit`, {
            csrf_token: csrfToken,
            submittedProblemIndex: problemIndex,
            programTypeId: programTypeId,
            source: sourceFileContent
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies
            }
        });

        if (submitResponse.status === 200) {
            res.send('Submission successful!');
        } else {
            res.status(400).send('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
