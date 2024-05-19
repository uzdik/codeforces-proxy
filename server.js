const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');

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

// Function to generate API signature
function generateApiSig(methodName, params, timestamp) {
    const sortedParams = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    const rand = crypto.randomBytes(6).toString('hex');
    const preHashString = `${rand}/${methodName}?${sortedParams}&time=${timestamp}#${apiSecret}`;
    const hash = crypto.createHash('sha512').update(preHashString).digest('hex');
    const apiSig = rand + hash.substring(0, 128);
    return apiSig;
}

// Endpoint to handle submission
app.post('/submit', async (req, res) => {
    const { handleOrEmail, password, problemIndex, programTypeId, sourceFileContent, contestId } = req.body;

    try {
        // Generate timestamp here
        const timestamp = Math.floor(Date.now() / 1000);

        // Generate API signature
        const apiSig = generateApiSig('contest.submit', {
            apiKey,
            contestId,
            problemIndex,
            programTypeId,
            source: sourceFileContent
        }, timestamp);

        // Submit the solution
        const response = await axios.post('https://codeforces.com/api/contest.submit', null, {
            params: {
                apiKey,
                contestId,
                problemIndex,
                programTypeId,
                source: sourceFileContent,
                time: timestamp,
                apiSig
            }
        });

        if (response.status === 200) {
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
