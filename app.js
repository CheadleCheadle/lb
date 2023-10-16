const express = require('express');
const app = express();
const http = require('http');
const port = 3000;

app.get('/', (req, res) => {
    console.log(
        `./lb \n`,
        `Received request from ${req.ip}\n`,
        `${req.method} / ${req.protocol}\n`,
        `Host: ${req.hostname}\n`,
        `User-Agent: ${req.originalUrl}\n`,
    );

    const req_options = {
        hostname: 'localhost',
        port: 8000,
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
});

app.listen(port, () => {
    console.log(`Listening in port ${port}`);
});
