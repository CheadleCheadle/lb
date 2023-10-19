const express = require("express");
const app = express();
const http = require("http");
const { program } = require("commander");
const port = 3000;

const servers = [
  { port: 8080, active: true },
  { port: 8081, active: true },
];

program
  .option(
    "-i, --interval <interval>",
    "Health check interval in milliseconds",
    "10000",
  )
  .parse(process.argv);


let current_index = 0;
let current_proxy = servers[current_index];

function nextProxy() {
  const next = servers[current_index];
  console.log("Server map", next);
  current_index = (current_index + 1) % servers.length;
  if (next.active) {
    current_proxy = next;
  } else {
    nextProxy();
  }
}

// Consider using a task scheduler to run this independent of the rest of the application. e.g. node-cron or PM2 to manage it
const interval = setInterval(health_check, program.opts().interval);
let iterations = 0;
const max_iterations = 20;

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
        console.log(res, res.statusCode);
        server.active = false;
      } else {
        // Put the server back in if its not already in there
        console.log(res.statusCode);
        server.active = true;
      }
    });

    req.on("error", (error) => {
      console.log(error);
      server.active = false;
    });
  });
}

app.get("/", (req, res) => {
  console.log(
    `./lb \n`,
    `Received request from ${req.ip}\n`,
    `${req.method} / ${req.protocol}\n`,
    `Host: ${req.hostname}\n`,
    `User-Agent: ${req.originalUrl}\n`,
    `Current Port: ${current_proxy.port}`,
    `Active: ${current_proxy.active}`,
  );

  const req_options = {
    hostname: "localhost",
    port: current_proxy.port,
    path: "/",
    method: "GET",
  };

  const proxy_request = http.request(req_options, (proxy_res) => {
    res.writeHead(proxy_res.statusCode, proxy_res.headers);
    proxy_res.pipe(res, {
      end: true,
    });
  });

  proxy_request.on("error", (err) => {
    console.log(err);
    res.status(500).send("Proxy request failed");
  });

  proxy_request.end();
  nextProxy();
});

app.listen(port, () => {
  console.log(`Listening in port ${port}`);
});
