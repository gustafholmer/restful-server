#!/usr/bin/env node

/**
 * Main program to run the server
 *
 */
 "use strict";

const VERSION = "1.0.0";

var path = require("path");
var scriptName = path.basename(process.argv[1]);
var args = process.argv.slice(2);
var arg, port;



//import server from "./bthAppServer.js";
var server = require("./bthAppServer.js");


/**
 * Display helptext about bad usage.
 *
 * @param String message to display.
 */
 function badUsage(message) {
    console.log(`${message}
$ node index.js -h to get an overview of available commands`);
}


/**
 * Display helptext about usage of this script.
 */
 function usage() {
    console.log(`Usage: ${scriptName} [options]

Options:
 -h               Display help text.
 -v               Display the version.
 --port <number>  Run server on this port.`);
}



/**
 * Display version.
 */
 function version() {
    console.log(VERSION);
}


arg = args.shift()

// Walkthrough all arguments checking for options.
switch (arg) {
    case "-h":
        usage();
        process.exit(0);
        break;

    case "-v":
        version();
        process.exit(0);
        break;

    case "--port":
        port = Number.parseInt(args.shift());
        if (Number.isNaN(port)) {
            badUsage("--port must be followed by a port number.");
            process.exit(1);
        }
        break;

    default:
        badUsage("Unknown argument.");
        process.exit(1);
        break;
}






// Main
server.listen(port);
console.log("The server is listening on: " + port);
