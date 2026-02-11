const http = require('http');

function post(message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ message });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve(parsed);
                } catch (e) {
                    resolve({ error: "Parse Error", reply: body });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

async function runDemo() {
    console.log("----- ⚡ STARTING SPORTSBOT DEMO ⚡ -----");

    console.log("\n1. Asking: 'Who is the GOAT of football? ⚽'");
    try {
        const res1 = await post("Who is the GOAT of football? ⚽");
        console.log(`🤖 Bot Update: ${res1.reply}`);
    } catch (e) { console.error(e); }

    console.log("\nWaiting 5 seconds (Rate Limit Check) ...");
    await new Promise(r => setTimeout(r, 5000));

    console.log("\n2. Asking: 'Why is golf so hard? ⛳'");
    try {
        const res2 = await post("Why is golf so hard? ⛳");
        console.log(`🤖 Bot Update: ${res2.reply}`);
    } catch (e) { console.error(e); }

    console.log("\n----- ⚡ DEMO COMPLETE ⚡ -----");
}

runDemo();
