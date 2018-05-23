/* eslint-disable no-console */

import { Server } from "rpc-websockets";

import rust from "./rust";

const server = new Server({
  port: 1338,
  host: "localhost"
});

server.event("complete");
server.event("failed");
server.event("error");
server.event("output");

rust(server);

console.log("Server listening on http://localhost:1338/");
