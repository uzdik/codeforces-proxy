const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const FormData = require('form-data');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://uzdik.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const CODEFORCES_LOGIN_URL = 'https://codeforces.com/enter';
const CODEFORCES_SUBMIT_URL = 'https://codeforces.com/gym/515622/submit';

app.post('/submit', async (req, res) => {
    const { handleOrEmail, password, contestId, problemIndex, programTypeId, sourceFileContent } = req.body;
    
    console.log('Received submission request with data:', req.body);

    try {
        // Step 1: Log in to Codeforces
        console.log('Attempting to login to Codeforces...');
        let response = await axios.get(CODEFORCES_LOGIN_URL, { withCredentials: true });
        console.log('Login page response status:', response.status);

        const cookies = response.headers['set-cookie'].join('; ');
        console.log('Extracted cookies:', cookies);

        const $ = cheerio.load(response.data);
        const csrfToken = $('input[name="csrf_token"]').val();
        const ftaa = $('input[name="ftaa"]').val();
        const bfaa = $('input[name="bfaa"]').val();

        console.log('Extracted CSRF token:', csrfToken);
        console.log('Extracted ftaa:', ftaa);
        console.log('Extracted bfaa:', bfaa);

        const loginData = new URLSearchParams({
            handleOrEmail,
            password,
            csrf_token: csrfToken,
            action: 'enter',
        });

        console.log('Sending login request with data:', loginData.toString());
        response = await axios.post(CODEFORCES_LOGIN_URL, loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: cookies,
            },
            withCredentials: true,
        });

        console.log('Login request response status:', response.status);
        if (response.status !== 302) {
            console.log('Login failed with status:', response.status);
            return res.status(400).send('Login failed');
        }

        // Step 2: Submit the solution
        console.log('Preparing solution submission data...');
        const submitData = new FormData();
        submitData.append('csrf_token', csrfToken);
        submitData.append('ftaa', ftaa);
        submitData.append('bfaa', bfaa);
        submitData.append('action', 'submitSolutionFormSubmitted');
        submitData.append('submittedProblemIndex', problemIndex);
        submitData.append('programTypeId', programTypeId);
        submitData.append('sourceFile', sourceFileContent, { filename: 'solution.txt' });

        console.log('Submitting solution...');
        response = await axios.post(CODEFORCES_SUBMIT_URL, submitData, {
            headers: {
                Cookie: cookies,
                ...submitData.getHeaders(),
            },
            withCredentials: true,
        });

        console.log('Submission response status:', response.status);
        if (response.status === 200) {
            console.log('Submission successful!');
            res.send('Submission successful!');
        } else {
            console.log('Submission failed with status:', response.status);
            res.status(400).send('Submission failed');
        }
    } catch (error) {
        console.log('Error during submission:', error);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
