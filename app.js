const express = require('express');
const app = express();
const http = require('http');
const port = 3000;

const servers = ['8080', 8081];

let current_index = 0;
let current_proxy = servers[current_index];

function nextProxy() {
    const next = servers[current_index];
    current_index = (current_index + 1) % servers.length;

    current_proxy = next;

}

app.get('/', (req, res) => {
    console.log(
        `./lb \n`,
        `Received request from ${req.ip}\n`,
        `${req.method} / ${req.protocol}\n`,
        `Host: ${req.hostname}\n`,
        `User-Agent: ${req.originalUrl}\n`,
        `Current Port: ${current_proxy}`,
    );

    const req_options = {
        hostname: 'localhost',
        port: current_proxy,
        path: '/',
        method: 'GET',
    };

    const proxy_request = http.request(req_options, (proxy_res) => {
        res.writeHead(proxy_res.statusCode, proxy_res.headers);
        proxy_res.pipe(res, {
            end: true,
        });
    });

    proxy_request.on('error', (err) => {
        console.log(err);
        res.status(500).send("Proxy request failed");
    })

    proxy_request.end();
    nextProxy();
});

app.listen(port, () => {
    console.log(`Listening in port ${port}`);
});
