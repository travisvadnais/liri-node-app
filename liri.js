//Pull in the .env keys
require("dotenv").config();
var fs = require("fs");

//Adding this in case I want to build in prompting
var inquirer = require("inquirer");

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


//***There are two ways to work this app - first is by running a node liri w/ no command which will initiate the prompt menu below***//

//Test for naked command line.  If so, run the Inquirer menu
if (!process.argv[2]) {
    inquirerMenu()
};

function inquirerMenu(){
    inquirer.prompt([
        {
            type: "list",
            message: "How can I help??",
            choices: ["Get movie info", "Get song info", "Get Tweets", "Surprise Me!", "Exit"],
            name: "requestType"
        }
    ])
    //Take choice and throw it into a switch statement
    .then(function(userRequest) {
        switch (userRequest.requestType) {
            case "Get movie info":
                //Ask what movie to look for
                inquirer.prompt([
                    {
                        type: "input",
                        message: "Which movie should I look for?",
                        name: "movie_selection"
                    }
                ])
                //Send movie request to the liribot fx
                .then(function(movieRequest) {
                    liribotOmdb(movieRequest.movie_selection);
                });            
                break;
            
            //Ask what song to look for
            case "Get song info":
                inquirer.prompt([
                    {
                        type: "input",
                        message: "What song should I look for?",
                        name: "song_selection"
                    }
                ])
                //Send it to liribot
                .then(function(songRequest){
                    liribotSpotify(songRequest.song_selection);
                });
                break;
            //Figure out whose Tweets we're looking for
            case "Get Tweets":
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Whose Tweets do you want to see?",
                        choices: ["Mine!", "Someone Else's!"],
                        name: "Twitter_choice"
                    }
                ])
                .then(function(whoseTweets){
                    //If someone else's, prompt for Twitter handle
                    if (whoseTweets.Twitter_choice == "Someone Else's!") {
                        inquirer.prompt([
                            {
                                type: "input",
                                message: "What is their EXACT Twitter handle?",
                                name: "Twitter_handle"
                            }
                        ])
                        //Shoot the handle to the liribot
                        .then(function(handle) {
                            liribotTwitter(handle.Twitter_handle);
                        });
                    }
                    //Otherwise, look for your own tweets
                    else {
                        liribotTwitter();
                    }
                });
                break;
            //Surprise me will pull from the random.txt doc and essentially run the BSB fx
            case "Surprise Me!":
                pullFromTxtFile();
                break;
            case "Exit":
                break;
        }
    });
};

//***THE SECOND WAY TO USE THE APP IS BY COMMAND LINE W/ NO PROMPTS***//

//Capture the user's command to feed into the Switch statement
var a = process.argv[2];

//Switch Statement using the command (process.argv[2]) as the argument
switch (a) {
    //First Case is Spotify Search
    case 'spotify-this-song':
        searchSpotify();
        break;
    case 'get-tweets':
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
    default:
        console.log("Not a valid command.  Please choose one of the following options:");
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
    var name = process.argv[3];

    fs.appendFile("log.txt", ["\n", [process.argv[2], name]], function(err) {
        if (err) throw err;
    });
    //Pre-Made fx from docs to req last 20 user tweets
    T.get("statuses/user_timeline", {screen_name: name, count: 20}, function(error, tweets, response) {
        
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
    fs.appendFile("log.txt", ["\n", "do-what-it-says"], function(err) {
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

        //If we're running this function off of the prompt menu (not hardcoded argument), run the menu again
        if (!process.argv[2]) {
            inquirerMenu();
        }
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
            "Command": "get-tweets"
        },
        "To pull a song from the Txt File": {
            "Command": "do-what-it-says"
        }
    };
    console.log("Remember, all commands are preceded with: node liri ");
    console.log(menuOptions);
};

//Movie function when initiated from Inquirer
function liribotOmdb(movieReq) {
    
    //Log the command and movie name
    fs.appendFile("log.txt", ["\n", "movie-this", movieReq], function(err) {
        if (err) throw err;
    });

    //Checks for user input AFTER the command.  If none, enter in Mr. Nobody
    if (!movieReq) {
        console.log("You didn't pick a movie, so please enjoy this one instead!");
        movieReq = "Mr. Nobody";
    };
    
    //Set up Parameters argument w/ the API Key & movie name
    var params = {
        "apiKey": "trilogy",
        "title": movieReq
    };

    //Run the GET request
    omdb.get(params, function(err, movie) {

        //Log the errors
        if(err) {
            console.error(err);
            inquirerMenu();
            return;
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
        inquirerMenu();
    });
};

//Song function when initiated from Inquirer
function liribotSpotify(songReq) {

    //Log the command and movie name
    fs.appendFile("log.txt", ["\n", "spotify-this-song", songReq], function(err) {
        if (err) throw err;
    });

    //This will be an array of album objects
    var albumList = [];

    //If no selection was made (i.e. inputs[3]), run the aceOfBase fx and stop this fx.
    if (!songReq) {
        aceOfBase();
        inquirerMenu();
        return;
    }

    //Search Spotify using the keys (S)
    S.search({type: 'track', query: songReq, limit: 5}, function(err, data) {
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
        checkDefault(albumList, songReq);

        //Log the results
        console.log("Results for: " + songReq);
        console.log(albumList);
        inquirerMenu();
    }); //End Spotify Search

    


}

//Twitter function when initiated from Inquirer
function liribotTwitter(handle) {

    //Log the command and movie name
    fs.appendFile("log.txt", ["\n", "get-tweets", handle], function(err) {
        if (err) throw err;
    });

    //Set up an array for the Tweet objects
    var tweetList = [];

    //Pre-Made fx from docs to req last 20 user tweets
    T.get("statuses/user_timeline", {screen_name: handle, count: 20}, function(error, tweets, response) {
        
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
        inquirerMenu();
    });
};