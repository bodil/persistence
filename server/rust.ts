/* eslint-disable no-console */

import * as fs from "fs";
import * as path from "path";
import * as proc from "child_process";
import {writeBuf} from "./repltools";

export default function(server) {
  server.register("rust", (args) => {
    let outbuf = "";
    let errbuf = "";
    fs.writeFile(path.resolve(__dirname, "rust", "src", "main.rs"), args.src, "utf8", (err) => {
      if (err) {
        server.emit("error", err.toString());
      } else {
        console.log(`COMMAND: cargo ${args.args}`);
        const cargo = proc.spawn("cargo", args.args, {
          cwd: path.resolve(__dirname, "rust"),
          stdio: "pipe"
        });
        cargo.on("exit", (code, signal) => {
          console.log(`EXIT ${code}: cargo ${args.args}`);
          if (code == 0) {
            server.emit("complete");
          } else {
            server.emit("failed", {code, signal});
          }
        });
        cargo.on("error", (err) => {
          console.error(`ERROR: ${err}`);
          server.emit("error", err.toString());
        });
        cargo.stdout.on("data", (data: Buffer) => {
          outbuf = writeBuf(outbuf, data.toString("utf8"), (line) => server.emit("output", {data: line, error: false}));
          process.stdout.write(data);
        });
        cargo.stderr.on("data", (data: Buffer) => {
          errbuf = writeBuf(errbuf, data.toString("utf8"), (line) => server.emit("output", {data: line, error: true}));
          process.stderr.write(data);
        });
      }
    });
  });
};
