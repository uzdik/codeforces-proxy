const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const FormData = require('form-data');

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

// Codeforces API credentials
const apiKey = '3c97906f0cf30e31a94c9018addc4eecd2ebf690';
const apiSecret = 'b0c12b48a8db54aeae1043466eb0270aba782867';

const CODEFORCES_SUBMIT_URL = 'https://codeforces.com/api/contest.hacks';

app.post('/submit', async (req, res) => {
    const { problemIndex, programTypeId, sourceFileContent } = req.body;

    try {
        // Generate time in unix format
        const time = Math.floor(Date.now() / 1000);

        // Generate random string for apiSig
        const rand = Math.random().toString(36).substring(2, 8);

        // Generate apiSig using SHA-512 hash
        const params = `apiKey=${apiKey}&time=${time}`;
        const paramString = `/${rand}/contest.hacks?${params}#${apiSecret}`;
        const apiSig = rand + crypto.createHash('sha512').update(paramString).digest('hex');

        // Submit the solution using API key and signature
        const submitData = new FormData();
        submitData.append('apiKey', apiKey);
        submitData.append('time', time);
        submitData.append('apiSig', apiSig);
        submitData.append('submittedProblemIndex', problemIndex);
        submitData.append('programTypeId', programTypeId);
        submitData.append('sourceFile', sourceFileContent, { filename: 'solution.txt' });

        const response = await axios.post(CODEFORCES_SUBMIT_URL, submitData, {
            headers: {
                ...submitData.getHeaders(),
            },
        });

        if (response.status === 200) {
            res.send('Submission successful!');
        } else {
            res.status(400).send('Submission failed');
        }
    } catch (error) {
        console.error('Error submitting solution:', error);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
