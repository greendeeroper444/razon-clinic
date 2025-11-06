require('dotenv').config();
const moceansdk = require('mocean-sdk');

const API_TOKEN = process.env.MOCEAN_API_TOKEN;

console.log('=== CHECKING CREDENTIALS ===');
console.log('API Token exists:', !!API_TOKEN);
console.log('API Token length:', API_TOKEN ? API_TOKEN.length : 0);
console.log('First 20 chars:', API_TOKEN ? API_TOKEN.substring(0, 20) : 'NONE');
console.log('===========================\n');

if (!API_TOKEN) {
    console.error('ERROR: MOCEAN_API_TOKEN not found in .env file');
    process.exit(1);
}

const mocean = new moceansdk.Mocean(
    new moceansdk.Client({ apiToken: API_TOKEN })
);

mocean.sms().send({
    'mocean-from': 'MOCEAN',
    'mocean-to': '639501049657',
    'mocean-text': 'Hello, Good morning'
}, function(err, res) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Response:', JSON.stringify(res, null, 2));
    
    if (res.messages[0].status === 1) {
        console.log('\nAuthorization Failed - Check your API token in .env file');
        console.log('Make sure MOCEAN_API_TOKEN is correct in your .env');
    }
});

//node src/testing/smsSender.js