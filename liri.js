//Pull in the .env keys
require("dotenv").config();

//Pull the key exports
var keylist = require("./keys.js");

//Spotify packages & keys
//Put the spotify package in a variable
var Spotify = require('node-spotify-api');
//Put the Spotify keys in a variable
var S = new Spotify(keylist.spotify);


//Twitter packages & keys
//Put the Twitter package in a variable
var Twitter = require('twitter-request')
//Put the Twitter keys in a variable
var T = new Twitter(keylist.twitter);

//Capture the user's command to feed into the Switch statement
var a = process.argv[2];

//Switch Statement using the command (process.argv[2]) as the argument
switch (a) {
    //First Case is Spotify Search
    case 'spotify-this-song':
        searchSpotify();
        break;
    case 'my-tweets':
        getTweets();
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

    //Search Spotify using the keys (S)
    S.search({type: 'track', query: titleTrack, limit: 5}, function(err, data) {
        //Check for errors
        if (err) {
            return console.log("Error Occurred: " + err);
        }

        //If no errors, add an object into the albumList array for each album containing the song, up to 5.
        for (var i = 0; i < data.tracks.items.length; i++) {
            albumList[i] = {
                "Song Choice": i + 1,
                "Band Name": data.tracks.items[i].album.artists[0].name,
                "Song Preview": data.tracks.items[i].preview_url,
                "Album Title": data.tracks.items[i].album.name
            }
        }
        //Run a fx to make sure at least 1 result came back
        checkDefault(albumList, titleTrack);

        //Log the results
        console.log("Results for: " + titleTrack);
        console.log(albumList);
    }); //End Spotify Search
}

//This will check to see if any songs were returned and, if not, suggest Ace of Base as a default
function checkDefault(arr, songName) {
    if (arr.length == 0) {
        var defaultSong = {
            "No results for": songName + " Try this instead!",
            "Band Name": "Ace of Base",
            "Song Title": "The Sign",
            "Song Preview": 'https://p.scdn.co/mp3-preview/5ca0168d6b58e0f993b2b741af90ecc7c9b16893?cid=b8831b3b77394f828a1e4e53ab3d61fd',
            "Album Title": 'The Sign (US Album) [Remastered]'
        }
        arr.push(defaultSong);
    }
}


//Function to run the Twitter piece
function getTweets() {

}