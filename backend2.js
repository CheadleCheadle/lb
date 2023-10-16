const express = require('express');
const app = express();
const port = 8081;

app.get('/', (req, res) => {
    console.log(
        `./lb \n`,
        `Received request from ${req.ip}\n`,
        `${req.method} / ${req.protocol}\n`,
        `Host: ${req.hostname}\n`,
        `User-Agent: ${req.originalUrl}\n`,

    );
    res.send("Hello from Backend #2");
});

app.listen(port, () => {
    console.log(`Listening in port ${port}`);
});
