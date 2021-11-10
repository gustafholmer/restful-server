#!/usr/bin/env node


/**
 * Main program to run the client
 *
 */
 "use strict";

const VERSION = "1.0.0";

// For CLI usage
var path = require("path");
var scriptName = path.basename(process.argv[1]);
var args = process.argv.slice(2);
var server;


var port;

var bthAppClient = require("./bthAppClient.js");
var app = new bthAppClient();

 // Make it using prompt
var readline = require("readline");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


/**
 * Display helptext about usage.
 */
 function usage() {
    console.log(`Usage: ${scriptName} [options]

Options:
 -h                                     Display help text.
 -v                                     Display the version.
 --server <server> --port <number>      Set the server and port to use.`);
}


/**
 * Display helptext about bad usage.
 *
 * @param String message to display.
 */
 function badUsage(message) {
    console.log(`${message}
Use -h to get an overview of the commands.`);
}


/**
 * Display version.
 */
 function version() {
    console.log(VERSION);
}



switch (args[0]) {
    case "-h":
        usage();
        process.exit(0);
        break;

    case "-v":
        version();
        process.exit(0);
        break;

    case "--server":
        var tempServer = args[1];
        

        if (tempServer === undefined) {
            badUsage("--server must be followed by a url.");
            process.exit(1);
        }

        var checkPortCommand = args[2];

        if ( checkPortCommand === "--port") {
            port = args[3];
        }

        if (port === undefined || Number.isNaN(Number.parseInt(port))) {
            badUsage("<server> must be followed by --port <number>");
            process.exit(1);
        }
        
        server = `http://${tempServer}:${port}`;

        break;

    default:
        badUsage("Unknown argument.");
        process.exit(1);
        break;
}



/**
 * Display a menu.
 */
 function menu() {
    console.log(`Commands available:
 exit             Leave this program.
 menu             Print this menu.
 url              Get url to view the server in browser.
 list             List all rooms.
 view <id>        View the room with the selected id.
 house <house>    View the names of all rooms in this building (house).
 search <string>  View the details of all matching rooms (one per row).
 searchp <string> View the details of all matching rooms (one per row) with priority.
 -------
 With the commands "list", "house", "search" and "searchp" you can write: max <number>
 as an additional argument to output a fixed amount of search results`);
}


/**
 * Callbacks for game asking question.
 */
 rl.on("line", function(line) {
    // Split incoming line with arguments into an array
    var args = line.trim().split(" ");

    args = args.filter(value => {
        return value !== "";
    });

    switch (args[0]) {
        case "exit":
            console.log("See ya!");
            process.exit(0);
            break;

        case "menu":
            menu();
            rl.prompt();
            break;

        case "url":
            console.log(`URL:\t ${server}`);
            rl.prompt();
            break;

        case "list":
            var maxNumber;

            if (args[1] === "max" && !Number.isNaN(parseInt(args[2]))) {

                maxNumber = args[2];
                
            }
            
            app.list(maxNumber)
                .then(value => {
                    console.log(value);
                    rl.prompt();
                })
                .catch(err => {
                    console.log("FAILED: Could not list the rooms.\nDetails: " + err);
                    rl.prompt();
                });
            break;
            
        case "view":
            var id = args[1];

            app.view(id)
                .then(value => {
                    console.log(value);
                    rl.prompt();
                })
                .catch(err => {
                    console.log("FAILED: Could not get details about the room.\nDetails: " + err);
                    rl.prompt();
                });
            break;

        case "house":
            var id = args[1];

            var maxNumber;

            if (args[2] === "max" && !Number.isNaN(parseInt(args[3]))) {
                maxNumber = args[3];
            }

            app.house(id, maxNumber)
                .then(value => {
                    console.log(value);
                    rl.prompt();
                })
                .catch(err => {
                    console.log("FAILED: Could not get names of the rooms in the building.\nDetails: " + err);
                    rl.prompt();
                });
            break;

            case "search":
                var searchString = args[1];
    
                var maxNumber;

                if (args[2] === "max" && !Number.isNaN(parseInt(args[3]))) {
                    maxNumber = args[3];
                    
                }

                app.search(searchString, maxNumber)
                    .then(value => {
                        console.log(value);
                        rl.prompt();
                    })
                    .catch(err => {
                        console.log("FAILED: Search failed.\nDetails: " + err);
                        rl.prompt();
                    });
                break;


            case "searchp":
                var searchString = args[1];
                
                var maxNumber;

                if (args[2] === "max" && !Number.isNaN(parseInt(args[3]))) {
                    maxNumber = args[3];
                }

                app.searchp(searchString, maxNumber)
                    .then(value => {
                        console.log(value);
                        rl.prompt();
                    })
                    .catch(err => {
                        console.log("FAILED: Search failed.\nDetails: " + err);
                        rl.prompt();
                    });
                break;
    


    default:
        console.log("Enter 'menu' to get an overview of what commands you can use");
        rl.prompt();

    
    }

})




app.setServer(server);
console.log("Use -h to get a list of options to use when starting this program.");
console.log("Ready to talk to server url '" + server + "' at port number '" + port + "'." );
console.log("Use 'menu' to get a list of commands.");
rl.setPrompt("bthAppClient$ ");
rl.prompt();
