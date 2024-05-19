const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const FormData = require('form-data');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://uzdik.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const CODEFORCES_LOGIN_URL = 'https://codeforces.com/enter';
const CODEFORCES_SUBMIT_URL = 'https://codeforces.com/gym/515622/submit';

app.post('/submit', async (req, res) => {
    const { handleOrEmail, password, problemIndex, programTypeId, contestID, sourceFileContent } = req.body;

    try {
        // Step 1: Log in to Codeforces
        let response = await axios.get(CODEFORCES_LOGIN_URL, { withCredentials: true });
        const cookies = response.headers['set-cookie'].join('; ');

        const $ = cheerio.load(response.data);
        const csrfToken = $('input[name="csrf_token"]').val();
        const ftaa = $('input[name="ftaa"]').val();
        const bfaa = $('input[name="bfaa"]').val();

        const loginData = new URLSearchParams({
            handleOrEmail,
            password,
            csrf_token: csrfToken,
            action: 'enter',
        });

        response = await axios.post(CODEFORCES_LOGIN_URL, loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: cookies,
            },
            withCredentials: true,
        });

        if (response.status !== 302) {
            return res.status(400).send('Login failed');
        }

        // Step 2: Submit the solution
        const submitData = new FormData();
        submitData.append('csrf_token', csrfToken);
        submitData.append('ftaa', ftaa);
        submitData.append('bfaa', bfaa);
        submitData.append('action', 'submitSolutionFormSubmitted');
        submitData.append('submittedProblemIndex', problemIndex);
        submitData.append('programTypeId', programTypeId);
        submitData.append('sourceFile', sourceFileContent, { filename: 'solution.txt' });

        response = await axios.post(CODEFORCES_SUBMIT_URL, submitData, {
            headers: {
                Cookie: cookies,
                ...submitData.getHeaders(),
            },
            withCredentials: true,
        });

        if (response.status === 200) {
            res.send('Submission successful!');
        } else {
            res.status(400).send('Submission failed');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
