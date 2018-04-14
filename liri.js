require("dotenv").config();
var keylist = require("./keys.js");

//Spotify packages & keys
//Put the spotify package in a variable
var Spotify = require('node-spotify-api');
//Put the Spotify keys in a variable
var S = new Spotify(keylist.spotify);
//console.log(S);

//Capture the user's command to feed into the Switch statement
var a = process.argv[2];


switch (a) {
    case 'spotify-this-song':
        searchSpotify();
        break;
}



//Function will run when Spotify is the command
function searchSpotify() {
    //Set up a variable to capture the track the user wants to search for
    var titleTrack = "";

    //This will be an array of album objects
    var albumList = [];

    //Capture the track we're looking for
    for (var i = 3; i < process.argv.length; i++) {
        titleTrack += process.argv[i] + " ";
    }
    //console.log(titleTrack);

    //Search Spotify using the keys (S)
    S.search({type: 'track', query: titleTrack, limit: 5}, function(err, data) {
        //Check for errors
        if (err) {
            return console.log("Error Occurred: " + err);
        }

        //If no errors, we're going to add an object for each album containing the song, up to 5.
        for (var i = 0; i < data.tracks.items.length; i++) {
            albumList[i] = {
                "Song Choice": i + 1,
                "Band Name": data.tracks.items[i].album.artists[0].name,
                "Song Title": titleTrack,
                "Song Preview": data.tracks.items[i].preview_url,
                "Album Title": data.tracks.items[i].album.name
            }
        }
        console.log(albumList);
    }); //End Search
}