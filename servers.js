const express = require("express");
const server1 = express();
const server2 = express();
const server3 = express();

const response_handler = (id) => (req, res) => {
  console.log(
    `./lb \n`,
    `Received request from ${req.ip}\n`,
    `${req.method} / ${req.protocol}\n`,
    `Host: ${req.hostname}\n`,
    `User-Agent: ${req.originalUrl}\n`,
  );
  res.send(`Response ${id} \n`);
};

server1.get("/", response_handler(1));
server2.get("/", response_handler(2));
server3.get("/", response_handler(3));

server1.listen(8080, (error) => {
  if (error) {
    console.log(`Failure to launch ${error}`);
  } else {
    console.log(`Listening on port 8080`);
  }
});

server2.listen(8081, (error) => {
  if (error) {
    console.log(`Failure to launch ${error}`);
  } else {
    console.log(`Listening on port 8081`);
  }
});

server3.listen(8082, (error) => {
  if (error) {
    console.log(`Failure to launch ${error}`);
  } else {
    console.log(`Listening on port 8082`);
  }
});
