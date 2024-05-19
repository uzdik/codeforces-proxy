const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const qs = require('querystring');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://uzdik.github.io'); // Replace with your GitHub Pages URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const CODEFORCES_LOGIN_URL = 'https://codeforces.com/enter';
const CODEFORCES_SUBMIT_URL = 'https://codeforces.com/gym/515622/submit';

// Endpoint to handle submission
app.post('/submit', async (req, res) => {
    // Your existing code for handling submission
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
