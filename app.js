const express = require("express");
const app = express();
const http = require("http");
const { program } = require("commander");
const port = 3000;
const axios = require("axios");

// Servers
const servers = [
  { port: 8080, active: true },
  { port: 8081, active: true },
  { port: 8082, active: true },
];

// Track the current server to send request
let current_index = 0;
const current_server = servers[current_index];

// Handle interval flag when starting the load balancer
program
  .option(
    "-i, --interval <interval>",
    "Health check interval in milliseconds",
    "10000",
  )
  .parse(process.argv);

async function proxy_handler(req, res) {
  const { method, url, headers, body } = req;
  const server = servers[current_index];

  current_index = (current_index + 1) % servers.length;

  try {
    const options = {
      url: `http://localhost:${server.port}`,
      method,
      headers,
      data: body,
    };

    const response = await axios(options);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Proxy request failed. Health check will deativate dead servers");
  }
}

const interval = setInterval(health_check, program.opts().interval);

let iterations = 0;
const max_iterations = 100;

function health_check() {
  if (iterations >= max_iterations) {
    clearInterval(interval);
  }

  servers.forEach((server, index) => {
    const options = {
      hostname: "localhost",
      port: server.port,
      path: "/",
      method: "GET",
    };

    console.log(`Port ${server.port} is active: ${server.active}`);

    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        server.active = false;
      } else {
        server.active = true;
      }
    });

    req.on("error", (error) => {
      server.active = false;
    });

    req.end();
  });
}

app.get("/", (req, res) => {
  console.log(
    `./lb \n`,
    `Received request from ${req.ip}\n`,
    `${req.method} / ${req.protocol}\n`,
    `Host: ${req.hostname}\n`,
    `User-Agent: ${req.originalUrl}\n`,
    `Current Port: ${current_server.port}`,
    `Active: ${current_server.active}`,
  );

  proxy_handler(req, res);
});


app.listen(port, () => {
  console.log(`Listening in port ${port}`);
});
