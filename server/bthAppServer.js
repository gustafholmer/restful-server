/**
 * Server for BTH App
 */
 "use strict";

 var Router = require("./router.js");
 var router = new Router();


 var http = require("http");
 var url = require("url");

 var qs = require("querystring");





 const fs = require('fs');
 var rawdata = fs.readFileSync('salar.json'); // need to set out path to file
 var rooms = JSON.parse(rawdata);









/**
 * Display a helptext about the API.
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/", (req, res) => {
    res.writeHead(200, "Content-Type: text/plain");
    res.write("Welcome to the BTH app server. This is the API of what can be done.\n\n" +
        " /                         Display this helptext.\n" +
        " /room/list                Display all rooms.\n" +
        " /room/view/id/:number     Display information about the room \n" +
        " /room/view/house/:house   Display all the rooms in a building.\n" +
        " /room/search/:search      Display the rooms which matches the search string\n" +
        " /room/searchp/:search     Display the rooms which matches the search string with priority\n" +
        " <path>?max=<number>       Display only a maximum amount of rooms\n"
    );
    res.end();
});



/**
 * Wrapper function for sending a JSON response
 *
 * @param  Object        res     The response
 * @param  Object/String content What should be written to the response
 * @param  Integer       code    HTTP status code
 */
 function sendJSONResponse(res, content, code = 200) {
    res.writeHead(code, "Content-Type: application/json");
    res.write(JSON.stringify(content, null, "    "));
    res.end();
}




/**
 * Return the number which will be max
 *
 * @param  Object  req The request
 * 
 */
function maxQueryCheck(req) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    var max = query.max;
    
    return max;
}



/**
 * Lists all the rooms
 *
 * @param Object req The request
 * @param Object res The response
 */
 router.get("/room/list", (req, res) => {
    
    var max = maxQueryCheck(req);

    if (max !== undefined) {
        // Send the response if query max
        sendJSONResponse(res, 
            {
                "salar": rooms.salar.slice(0, max)
            }
        );
    } else {
        // Else send response without maximum 
        sendJSONResponse(res, 
            rooms
        );

    }


});





/**
 * Lists all the rooms which matches the number.
 *
 * @param Object req The request
 * @param Object res The response
 */
 router.get("/room/view/id/:number", (req, res) => {
    // get value of the parameter :number
    // decode to work with åäö
    var roomNumber = decodeURI(req.params.number);
    let listOfRooms = rooms.salar;
    let response = {
        "message": "No rooms matches the search"
    }

    for (var i = 0; i < listOfRooms.length; i++) {
        if (listOfRooms[i].Salsnr !== null && listOfRooms[i].Salsnr.toLowerCase() === roomNumber.toLowerCase()) { // works with lowercase
            response = listOfRooms[i];
            break;
        }
    }

    // Send the response
    sendJSONResponse(res, 
        response
    );
});


/**
 * Lists all room names (room ID is used if name is missing) which are located in an building.
 * 
 *  
 * @param Object req The request
 * @param Object res The response
 */
 router.get("/room/view/house/:house", (req, res) => {
    // get value of the parameter :number
    // decode to work with åäö
    var originalString;
    var house = decodeURI(req.params.house.toLowerCase());
    var listOfRequestedRooms = [];
    let listOfRooms = rooms.salar;
    let response = {
        "message": "No rooms in house matches the search"
    }

    for (var i = 0; i < listOfRooms.length; i++) {
        if (listOfRooms[i].Hus !== null && listOfRooms[i].Hus.toLowerCase() === house) {
            originalString = listOfRooms[i].Hus;

            if (listOfRooms[i].Salsnamn === null) {
                listOfRequestedRooms.push("Room name is missing, here is room ID instead: " + listOfRooms[i].Salsnr);
            } else {
                listOfRequestedRooms.push("Room name: " + listOfRooms[i].Salsnamn);
            }
            
        }
    }


    if (listOfRequestedRooms.length !== 0) {
        response = {
            [originalString]: listOfRequestedRooms
        }
    }


    // The the max query
    var max = maxQueryCheck(req);

    if (max !== undefined) {
        // Send the response if query max
        sendJSONResponse(res, 
            {
                [originalString]: listOfRequestedRooms.slice(0, max)
            }
        );
    } else {
        // Else send response without maximum 
        sendJSONResponse(res, 
            response
        );
    }

});




/**
 * Lists all matches of search string.
 *
 * @param Object req The request
 * @param Object res The response
 */
 router.get("/room/search/:search", (req, res) => {
    // get value of the parameter :search
    // decode to work with åäö
    var originalString = decodeURI(req.params.search);
    var searchString = decodeURI(req.params.search.toLowerCase());
    let listOfRooms = rooms.salar;
    let response = {
        "message": "No matches"
    }

    var listOfSearchResult = [];


    // Loop through all the rooms and search for any matches in the object's fields/values.
    for (var roomObj = 0; roomObj < listOfRooms.length; roomObj++) {
        
        var valuesOfObject = Object.values(listOfRooms[roomObj]);
        
        var ifMatch = valuesOfObject.filter(x => 
            {
                if (x !== null) {
                    var test = x.toLowerCase();

                    return test.includes(searchString)
                }
            }
            
            );

        // If any match in the object's values/fields. Push the object to the result array.
        if (ifMatch.length !== 0) {
            listOfSearchResult.push(listOfRooms[roomObj]);
        }
    }

    // Create the response.
    if (listOfSearchResult.length !== 0) {
        response = {
            [originalString]: listOfSearchResult
        }
    }


    // The the max query
    var max = maxQueryCheck(req);

    if (max !== undefined) {
        // Send the response if query max
        sendJSONResponse(res, 
            {
                [originalString]: listOfSearchResult.slice(0, max)
            }
        );
    } else {
        // Else send response without maximum 
        sendJSONResponse(res, 
            response
        );
    }


 
});



// NOTE! Maybe not correctly choosen priority scoring for the different fields
var priorityList = {
    Salsnr: 0.9,
    Salsnamn: 0.8,
    Lat: 0.1,
    Long: 0.2,
    Ort: 0.6,
    Hus: 0.7,
    Våning: 0.5,
    Typ: 0.4,
    Storlek: 0.3
}



/**
 * Gets the key of passed in value.
 *
 * @param Object object of the key and value pair.
 * @param String value of the object key and value pair.
 */
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }



/**
 * Checks if search strings aligns with whole field.
 *
 * @param String searchString The search value to check.
 * @param String fieldToTest The existing field in an object.
 */
function checkIfWholeField(searchString, fieldToTest) {
    
    let re = new RegExp(fieldToTest);

    if (searchString.match(re)) {
        return 0.9;
    }

    return 0.1;
}


/**
 * Checks if search string aligns at the beginning of the field.
 *
 * @param String searchString The search value to check.
 * @param String fieldToTest The existing field in an object.
 */
function checkIfBeginningOfString(searchString, fieldToTest) {

    if (fieldToTest.startsWith(searchString)) {
        return 0.9;
    }

    return 0.1
}


/**
 * Calculates the priority order.
 *
 * @param Array listOfSearchResult Array of Search result.
 * @param String searchString The search value to check.
 */
function prioritySorter(listOfSearchResult, searchString) {

    // Array to return when ordering are done.
    var finalListOfSearchResult = [{priorityDescription: "The following objects are sorted by their calculated search priority value which are displayed as an object key"}];
    
    // Loops through every item in array and use the object's content to calculate the priority order.
    for (var roomObj = 0; roomObj < listOfSearchResult.length; roomObj++) {
        var valuesOfObject = Object.values(listOfSearchResult[roomObj]);
        var ifMatch = [];
        
        // Loop through and check every field in the object
        for (var i = 0; i < valuesOfObject.length; i++) {

            if (valuesOfObject[i] !== null) {
                var test = valuesOfObject[i].toLowerCase();
            
                if (test.includes(searchString)) {

                    var prioField;

                    // field priority (req 1)
                    if (valuesOfObject[i] !== null) {
                        prioField = getKeyByValue(listOfSearchResult[roomObj], valuesOfObject[i]);

                    }
                    var priorityValueRow = priorityList[prioField];
                    
                    // whole field priority (req 2)
                    var priorityWholeString = checkIfWholeField(searchString, test);
            
                    // beginning of string priority (req 3)
                    var priorityBeginningOfString = checkIfBeginningOfString(searchString, test);
                    

                    // calculate the priority value and connect it to the matched field.
                    
                    //ifMatch.push([test, ((priorityValueRow + priorityWholeString + priorityBeginningOfString) / 3)]);
                    ifMatch.push((priorityValueRow + priorityWholeString + priorityBeginningOfString) / 3);
                   
                }
            }
        }
        


        // Selects the value of the field with highest calculated priority value to be used as key for the room object later.
        var max = ifMatch.reduce(function(a, b) {

            return Math.max(a, b);
        });

        

        // Prepares the result object with the highest priority value as key and object room as value and round it to three decimals.
        if (ifMatch.length !== 0) {
            finalListOfSearchResult.push({[Math.round(max * 1000) / 1000]: listOfSearchResult[roomObj]});
        }
    }


    // Order the objects according to priority value order.
    finalListOfSearchResult.sort(function(a,b){ 
        var x = Object.keys(a)[0] < Object.keys(b)[0]? 1:-1; 
        return x; 
    });
    
    return finalListOfSearchResult;

}



/**
 * Lists all matches of search string with a priority.
 *
 * @param Object req The request
 * @param Object res The response
 */
 router.get("/room/searchp/:search", (req, res) => {

    // get value of the parameter :search
    // decode to work with åäö
    var originalString = decodeURI(req.params.search);
    var searchString = decodeURI(req.params.search.toLowerCase());
    let listOfRooms = rooms.salar;
    let response = {
        "message": "No matches"
    }

    

    var listOfSearchResult = [];

    for (var roomObj = 0; roomObj < listOfRooms.length; roomObj++) {
        
        var valuesOfObject = Object.values(listOfRooms[roomObj]);
        
        var ifMatch = valuesOfObject.filter(x => 
            {
                if (x !== null) {
                    var test = x.toLowerCase();
                    
                    return test.includes(searchString)
                }
            }
        );


        if (ifMatch.length !== 0) {
            listOfSearchResult.push(listOfRooms[roomObj]);
        }
    }


    // If any matches at all in the object's field. Calculate and sort the objects in the method "prioritySorter()".
    if (listOfSearchResult.length !== 0) {

        var sortedPriority = prioritySorter(listOfSearchResult, searchString);

        response = {
            [originalString]: sortedPriority
        }
    }


    // Send the response
    // The the max query
    var max = maxQueryCheck(req);

    if (max !== undefined) {
        // Send the response if query max
        sendJSONResponse(res, 
            {
                [originalString]: sortedPriority.slice(0, Number.parseInt(max) + 1)
            }
        );
    } else {
        // Else send response without maximum 
        sendJSONResponse(res, 
            response
        );
    }
});






/**
 * Create and export the server
 */
 var server = http.createServer((req, res) => {
    var ipAds, route;

    // Log incoming requests
    ipAds = req.connection.remoteAddress;

    

    route = decodeURI(url.parse(req.url).pathname);


    console.log("Incoming route " + route + " from ip " + ipAds);


    
    router.route(req, res);
});




module.exports = server;