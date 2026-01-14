/**
 * API诊断工具
 * 用于测试和诊断Agent Service的Automation API
 */

// 在浏览器控制台运行此代码来测试API

async function testAutomationAPI() {
    const DAG_ID = '600565437910010238';
    const token = 'ory_at_FRixrv6mlG0zRupdh9YLuOd1ORSZreB_C-QDwbSTe80.iRgE5MkqeW_0i59XI6LcHYrpx-JQyY46WF23hxL_dv4';

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    console.log('=== Testing Automation API ===');
    console.log('DAG ID:', DAG_ID);
    console.log('Token:', token.substring(0, 20) + '...');

    // Test 1: List DAG results (v2)
    console.log('\n--- Test 1: List DAG results (v2) ---');
    try {
        const url = `/proxy-agent-service/automation/v2/dag/${DAG_ID}/results?sortBy=started_at&order=desc&limit=20`;
        console.log('URL:', url);
        const response = await fetch(url, { headers });
        console.log('Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data:', data);
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Request failed:', error);
    }

    // Test 2: Try v1 API
    console.log('\n--- Test 2: Try v1 API ---');
    try {
        const url = `/proxy-agent-service/automation/v1/dag/${DAG_ID}/results`;
        console.log('URL:', url);
        const response = await fetch(url, { headers });
        console.log('Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data:', data);
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Request failed:', error);
    }

    // Test 3: List all DAGs
    console.log('\n--- Test 3: List all DAGs ---');
    try {
        const url = `/proxy-agent-service/automation/v2/dags`;
        console.log('URL:', url);
        const response = await fetch(url, { headers });
        console.log('Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Available DAGs:', data);
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Request failed:', error);
    }

    // Test 4: Get specific DAG info
    console.log('\n--- Test 4: Get DAG info ---');
    try {
        const url = `/proxy-agent-service/automation/v2/dag/${DAG_ID}`;
        console.log('URL:', url);
        const response = await fetch(url, { headers });
        console.log('Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! DAG info:', data);
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Request failed:', error);
    }

    console.log('\n=== Test Complete ===');
}

// 运行测试
testAutomationAPI();
