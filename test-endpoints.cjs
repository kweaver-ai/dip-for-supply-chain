const https = require('https');

const MODEL_ID = 'd58keb5g5lk40hvh48og';
const TOKEN = 'ory_at_RptP9IxnbBwiDLS0fUIRgENs64QRRIBoxh2H4hWddWw.dhjGjSVAB_Wz0cyvomSiPQC4W5t-thOVoaCsuGividQ';
const DOMAIN = 'dip.aishu.cn';

async function testQuery(path, name) {
    console.log(`Testing ${name} (${path})...`);

    const body = JSON.stringify({
        instant: true,
        start: Date.now() - 365 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        analysis_dimensions: ['item_id', 'item_name', 'inventory_data', 'available_quantity', 'quantity']
    });

    const options = {
        hostname: DOMAIN,
        port: 443,
        path: path,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            'X-HTTP-Method-Override': 'GET'
        },
        rejectUnauthorized: false
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`${name} Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const items = json.datas || (json.data && json.data.items) || [];
                        console.log(`${name} Found ${items.length} items`);
                        if (items.length > 0) {
                            console.log(`${name} Sample Item 0 Labels:`, JSON.stringify(items[0].labels));
                        }
                    } catch (e) {
                        console.log(`${name} Parse error: ${e.message}`);
                    }
                } else {
                    console.log(`${name} Error body snippet: ${data.substring(0, 200)}`);
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            console.error(`${name} Request Error:`, e.message);
            resolve();
        });
        req.write(body);
        req.end();
    });
}

async function run() {
    // Path used in app (via httpClient.postAsGet)
    await testQuery(`/api/mdl-uniquery/v1/metric-models/${MODEL_ID}`, 'App Endpoint');

    // Path seen in some examples
    await testQuery(`/api/mdl-uniquery/v1/mdl/model/query/${MODEL_ID}`, 'Alternative Endpoint');
}

run();
