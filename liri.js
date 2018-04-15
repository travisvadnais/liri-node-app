//Pull in the .env keys
require("dotenv").config();
var fs = require("fs");

//Pull the key exports
var keylist = require("./keys.js");

//Spotify packages & keys
//Put the spotify package in a variable
var Spotify = require('node-spotify-api');
//Put the Spotify keys in a variable
var S = new Spotify(keylist.spotify);


//Twitter packages & keys
//Put the Twitter package in a variable
var Twit = require('twit') 
//Put the Twitter keys in a variable
var T = new Twit(keylist.twitter);

//OMDB package
var omdb = require('omdb-client');

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
    case 'movie-this':
        getMovieData();
        break;
    case 'do-what-it-says':
        pullFromTxtFile();
        break;
    case 'help':
        helpMenu();
        break;
};

//Function will run when Spotify is the command
function searchSpotify() {
    //Set up a variable to capture the track the user wants to search for
    var titleTrack = "";

    //Put arguments in an array
    var inputs = process.argv;

    //This will be an array of album objects
    var albumList = [];

    //Capture the track we're looking for
    for (var i = 3; i < inputs.length; i++) {
        titleTrack += inputs[i] + " ";
    };

    //Add inputs to the log file
    fs.appendFile("log.txt", ["\n", process.argv[2], titleTrack], function(err) {
        if (err) throw err;
    })

    //If no selection was made (i.e. inputs[3]), run the aceOfBase fx and stop this fx.
    if (!inputs[3]) {
        aceOfBase();
        return;
    }

    //Search Spotify using the keys (S)
    S.search({type: 'track', query: titleTrack, limit: 5}, function(err, data) {
        //Check for errors
        if (err) {
            return console.log("Error Occurred: " + err);
        };

        //If no errors, add an object into the albumList array for each album containing the song, up to 5.
        for (var i = 0; i < data.tracks.items.length; i++) {
            albumList[i] = {
                "Song Choice": i + 1,
                "Band Name": data.tracks.items[i].album.artists[0].name,
                "Song Preview": data.tracks.items[i].preview_url,
                "Album Title": data.tracks.items[i].album.name
            };
        };
        //Run a fx to make sure at least 1 result came back
        checkDefault(albumList, titleTrack);

        //Log the results
        console.log("Results for: " + titleTrack);
        console.log(albumList);
    }); //End Spotify Search
};

//This will check to see if any songs were returned and, if not, suggest Ace of Base as a default
function checkDefault(arr, songName) {
    if (arr.length == 0) {
        var defaultSong = {
            "No results for": songName + " Try this instead!",
            "Band Name": "Ace of Base",
            "Song Title": "The Sign",
            "Song Preview": 'https://p.scdn.co/mp3-preview/5ca0168d6b58e0f993b2b741af90ecc7c9b16893?cid=b8831b3b77394f828a1e4e53ab3d61fd',
            "Album Title": 'The Sign (US Album) [Remastered]'
        };
        arr.push(defaultSong);
    };
};

//Function to run the Twitter piece
function getTweets() {

    //Set up an array for the Tweet objects
    var tweetList = [];

    fs.appendFile("log.txt", ["\n", process.argv[2]], function(err) {
        if (err) throw err;
    });
    //Pre-Made fx from docs to req last 20 user tweets
    //NOTE: This uses your key, so you can't search for someone else's tweets
    T.get("statuses/user_timeline", {count: 20}, function(error, tweets, response) {
        
        //Log the errors
        if(error) {
            console.log(error);
        } 
        else {
            //If no errors, get 20 most-recent tweets and create an object for each.
            for (var i = 0; i < tweets.length; i++) {
                //Push each tweet object into the array
                tweetList[i] = {
                    "Tweet_Number": i + 1,
                    "Tweet": tweets[i].text,
                    "Timestamp": tweets[i].created_at
                };
            };
            console.log(tweetList);
        };
    });
};

function getMovieData() {

    //Set up empty variable to capture movie name
    var movieName = "";

    //Capture all the user inputs in an array
    var inputs = process.argv;

    //Capture the movie we're looking for based on inputs
    for (var i = 3; i < inputs.length; i++) {
        movieName += inputs[i] + " ";
    };

    //Log the command and movie name
    fs.appendFile("log.txt", ["\n", process.argv[2], movieName], function(err) {
        if (err) throw err;
    });

    //Checks for user input AFTER the command.  If none, enter in Mr. Nobody
    if (!inputs[3]) {
        console.log("You didn't pick a movie, so please enjoy this one instead!");
        movieName = "Mr. Nobody";
    };
    //Set up Parameters argument w/ the API Key & movie name
    var params = {
        "apiKey": "trilogy",
        "title": movieName
    };

    //Run the GET request
    omdb.get(params, function(err, movie) {

        //Log the errors
        if(err) {
            return console.error(err);
        };

        //Message in case the movie isn't found.
        if(!movie) {
            return console.log('Movie not found!  Please Try Again!');
        }

        //If the movie is found, set up the movie data object to pull all pertinent info
        else {
            var movieData = {
                "Title": movie.Title,
                "Release Year": movie.Year,
                "IMDB Rating": movie.imdbRating,
                "Rotten Tomatoes Rating": movie.Ratings[1].Value,
                "Country": movie.Country,
                "Language": movie.Language,
                "Plot": movie.Plot,
                "Actors": movie.Actors
            }
            console.log(movieData);
        }
    });
};

//this fx will pull data from the random.txt file
function pullFromTxtFile() {

    //Log the command
    fs.appendFile("log.txt", ["\n", process.argv[2]], function(err) {
        if (err) throw err;
    });

    fs.readFile("random.txt", "utf8", function(error, data) {
        //Put the data into an array, split by the "," delimiter
        var randomArray = data.split(",");
        //Grab the song data (default was "I want it that way")
        var song = randomArray[1];
        //Run the bsb (backstreet boys fx)
        bsb(song);
    });
};

//This will run when pulling data from the txt file
function bsb(song) {
    //This will be an array of album objects
    var albumList = [];
    S.search({type: 'track', query: song, limit: 5}, function(err, data) {
        //Check for errors
        if (err) {
            return console.log("Error Occurred: " + err);
        };

        //If no errors, add an object into the albumList array for each album containing the song, up to 5.
        for (var i = 0; i < data.tracks.items.length; i++) {
            albumList[i] = {
                "Song Choice": i + 1,
                "Band Name": data.tracks.items[i].album.artists[0].name,
                "Song Preview": data.tracks.items[i].preview_url,
                "Album Title": data.tracks.items[i].album.name
            };
        };
        console.log(albumList);
    });
};

//This fx is used when the user doesn't in put a song
function aceOfBase() {

    //All we're doing is setting up an object w/ hardcoded Ace of Base song info & logging it
    var defaultSong = {
        "Band Name": "Ace of Base",
        "Song Title": "The Sign",
        "Song Preview": 'https://p.scdn.co/mp3-preview/5ca0168d6b58e0f993b2b741af90ecc7c9b16893?cid=b8831b3b77394f828a1e4e53ab3d61fd',
        "Album Title": 'The Sign (US Album) [Remastered]'
    };
    console.log("You didn't select a song.  Try this one instead!");
    console.log(defaultSong);
};

//Function just builds out and prints a help menu object if the user needs it.
function helpMenu() {

    //Log the command
    fs.appendFile("log.txt", ["\n", process.argv[2]], function(err) {
        if (err) throw err;
    });

    var menuOptions = {
        "To search for a song in Spotify": {
            "Command": "spotify-this-song",
            "Optional": "<Enter Song Title (w/ no brackets or quotes)>"
        },
        "To search for a movie in OMDB": {
            "Command": "movie-this",
            "Optional": "<Enter Movie Title (w/ no brackets or quotes)>"
        },
        "To review your 20 most-recent Tweets": {
            "Command": "my-tweets"
        },
        "To pull a song from the Txt File": {
            "Command": "do-what-it-says"
        }
    };
    console.log("Remember, all commands are preceded with: node liri ");
    console.log(menuOptions);
};
