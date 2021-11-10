#!/usr/bin/env node


var http = require("http");





/**
 * Class for client.
 *
 */
class bthAppClient {
    


    /**
     * Set the url of the server to connect to.
     *
     * @param  String url to use to connect to the server.
     *
     */
    setServer(url) {
        this.server = url;
    }

    /**
     * Requests all the rooms.
     *
     */
    list(maxNumber) {

        // Execute with max parameter
        if (maxNumber !== undefined) {
            return this.httpGet("/room/list?max=" + maxNumber);
        }
            
        return this.httpGet("/room/list");
    }

    /**
     * Requests info about one room.
     *
     * @param  Room id number.
     * 
     */
    view(idRoom) {
        return this.httpGet("/room/view/id/" + idRoom);
    }


    /**
     * Requests names of all rooms in a building.
     *
     * @param  House id number.
     * 
     */
    house(houseID, maxNumber) {

        // Execute with max parameter
        if (maxNumber !== undefined) {
            return this.httpGet("/room/view/house/" + houseID + "?max=" + maxNumber);
        }

        return this.httpGet("/room/view/house/" + houseID);
    }


    /**
     * Requests data matching string.
     *
     * @param  Search string.
     *
     */
    search(searchString, maxNumber) {

        // Execute with max parameter
        if (maxNumber !== undefined) {
            return this.httpGet("/room/search/" + searchString + "?max=" + maxNumber);
        }
        return this.httpGet("/room/search/" + searchString);
    }

    /**
     * Requests data matching string with priority.
     *
     * @param  Search string.
     *
     */
    searchp(searchString, maxNumber) {
        // Execute with max parameter
        if (maxNumber !== undefined) {
            return this.httpGet("/room/searchp/" + searchString + "?max=" + maxNumber);
        }
        return this.httpGet("/room/searchp/" + searchString);
    }



   /**
     * Make a HTTP GET request, wrapped in a Promise.
     *
     * @param  String url to connect to.
     *
     * @return Promise
     *
     */
    httpGet(url) {
        return new Promise((resolve, reject) => {
            http.get(this.server + url, (res) => {
                var data = "";

                res.on('data', (chunk) => {
                    data += chunk;
                }).on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                }).on('error', (e) => {
                    reject("Got error: " + e.message);
                });
            });
        });
    }
}




module.exports = bthAppClient;