
const https = require('https');

const data = JSON.stringify({
    offset: 0,
    limit: 10000
});

const options = {
    hostname: 'dip.aishu.cn',
    port: 443,
    path: '/api/mdl-uniquery/v1/data-views/2004376134629285892',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer ory_at_7c3mqWfiuY65L6ObT3AUcnCY1QKPDX6i6_G3pGitrqM.Q-6b9OIkAgxzi3HTYQ-_TVuV_IGgVFldWyOlenncuRE',
        'X-HTTP-Method-Override': 'GET',
        'Origin': 'http://127.0.0.1:5173', // Mimic local dev server
        'Referer': 'http://127.0.0.1:5173/'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        // console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
