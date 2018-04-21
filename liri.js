//Pull in the .env keys
require("dotenv").config();
var fs = require("fs");

//Allows for prompting
var inquirer = require("inquirer");

//Pull the key exports
var keylist = require("./keys.js");

var colors = require("colors");

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
            choices: ["Get Movie Info", "Get Song Info", "Get Tweets", "Surprise Me!", "Exit"],
            name: "requestType"
        }
    ])
    //Take choice and throw it into a switch statement
    .then(function(userRequest) {
        switch (userRequest.requestType) {
            case "Get Movie Info":
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
            case "Get Song Info":
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

if (a) {
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
            console.log(colors.red("\n****************************************************************"));
            console.log(colors.red("             ***********************************                "));
            console.log(colors.red("                           **********                           "));
            console.log(colors.red.bold("\nNot a valid command.  Please choose one of the following options:\n"));
            helpMenu();
            break;
    }
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

    //Trim the space off the end of the title so the quotation marks don't look stupid
    titleTrack = titleTrack.trim();

    //Add inputs to the log file
    fs.appendFile("log.txt", ["\n", process.argv[2], titleTrack], function(err) {
        if (err) throw err;
    })

    //If no selection was made (i.e. inputs[3]), run the aceOfBase fx and stop this fx.
    if (!inputs[3]) {
        aceOfBase();
        return;
    }

    //Add the song to the array so it doesn't just give you Ace of Base
    albumList[0] = titleTrack;

    //Search Spotify using the keys (S)
    S.search({type: 'track', query: titleTrack, limit: 2}, function(err, data) {
        
        //Check for errors
        if (err) {
            //Catches internet-specific errors
            if (err == "RequestError: Error: getaddrinfo ENOTFOUND accounts.spotify.com accounts.spotify.com:443") {
                console.log(colors.red.bold("\n! ! ! ! ERROR ! ! ! ! ERROR ! ! ! ! ERROR ! ! ! ! ERROR ! ! ! !\n"));
                console.log("Your internet is down!  Try again later");
                console.log(colors.red.bold("\n! ! ! ! ERROR ! ! ! ! ERROR ! ! ! ! ERROR ! ! ! ! ERROR ! ! ! !\n"));
                return;
            }
            else {
                return console.log("Error Occurred: " + err);
            }
        };

        //Set up a variable to navigate through the docs more easily
        var band = data.tracks.items;

        //Check to make sure a song came back.  If not, run the fx to throw in Ace of Base
        if (albumList.length == 0) {
            checkDefault(albumList);
        }

        else {

            //Change first letter of each word to uppercase
            var splitStr = titleTrack.toLowerCase().split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
            }
            // Directly return the joined string
            titleTrack = splitStr.join(' '); 

            //Display the first return song
            console.log(colors.blue("\n************************************************************************************************************\n"));
            console.log("------------MOST POPULAR------------".america);
            console.log("\n" + '"'.blue + (titleTrack + '"').blue + " by: " + colors.blue(band[0].album.artists[0].name)); 
            console.log("\nOff the album: " + colors.blue(band[0].album.name));
            //Check to see if there's a preview URL.  If not, offer the full album
            if (band[0].preview_url != null) {
                console.log("\nCheck out a clip here!");
                console.log(colors.blue(band[0].preview_url));
            }
            else {
                console.log("\nNo preview available, but check out the full album w/ your Spotify account here!");
                console.log(colors.blue(band[0].external_urls.spotify));
                console.log(colors.blue.bold("\n****************************************************************************************************************"));
            }

            //Display the second return song, assuming there is one.  If not, just throw some lines out there.
            if (band[1] != null) {
                console.log("\n------------RUNNER UP------------".america);
                console.log("\n" + '"'.yellow.bold + (titleTrack + '"').yellow.bold + " by: " + colors.yellow.bold(band[1].album.artists[0].name)); 
                console.log("\nOff the album: " + colors.yellow.bold(band[1].album.name));
                //Check to see if there's a preview URL.  If not, offer the full album
                if (band[1].preview_url != null) {    
                    console.log("\nCheck out a clip here!");
                    console.log(colors.yellow.bold(band[1].preview_url));
                    console.log(colors.yellow.bold("\n****************************************************************************************************************"));
                }
                else {
                    console.log("\nNo preview available, but check out the full album w/ your Spotify account here!");
                    console.log(colors.yellow(band[1].external_urls.spotify));
                    console.log(colors.yellow.bold("\n****************************************************************************************************************"));
                } 
            }
            else {
                console.log(colors.blue("\n*************************************************************************************************************\n"));
            }       
        }
    }); //End Spotify Search
};

//This will check to see if any songs were returned and, if not, suggest Ace of Base as a default
function checkDefault(arr, songName) {
    if (arr.length == 0) {

    //Log Ace of Base of the user doesn't input a song
    console.log(colors.blue("\n************************************************************************************************************\n"));
    console.log(colors.red("That's not a real song.  Try this one instead!"));
    console.log(colors.blue("\nThe Sign") + " by: " + colors.blue("Ace of Base")); 
    console.log("\nOff the album: " + colors.blue('The Sign (US Album) [Remastered]'));
    console.log("\nCheck out a clip here!");
    console.log(colors.blue("https://p.scdn.co/mp3-preview/5ca0168d6b58e0f993b2b741af90ecc7c9b16893?cid=b8831b3b77394f828a1e4e53ab3d61fd"));
    console.log(colors.blue("\n************************************************************************************************************\n"));

    };
};

//Function to run the Twitter piece
function getTweets() {

    //Set up an array for the Tweet objects
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
            //If no errors, get 10 most-recent tweets and loop through to fill out the log
            for (var i = 0; i < tweets.length; i++) {

                //Log the tweets
                console.log(colors.green("\n*********************** Tweet " + (i + 1) + " ***********************"));
                console.log(colors.cyan("\n" + tweets[i].text));
                console.log(colors.grey("\nTweeted at: " + tweets[i].created_at));

            };
            console.log(colors.green("\n********************** End Tweets **********************\n"));
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

    //Get rid of that obnoxious space after the movie
    movieName = movieName.trim();

    //Log the command and movie name
    fs.appendFile("log.txt", ["\n", process.argv[2], movieName], function(err) {
        if (err) throw err;
    });

    //Checks for user input AFTER the command.  If none, enter in Mr. Nobody
    if (!inputs[3]) {
        console.log(colors.blue("************************************************************************************************************************"));
        console.log(colors.red("\nYou didn't pick a movie, so please enjoy this one instead!"));
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

        //If the movie is found, log the pertinent info
        else {

            //Change first letter of each word to uppercase
            var splitStr = movieName.toLowerCase().split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
            }
            // Directly return the joined string
            movieName = splitStr.join(' '); 

            console.log(colors.blue("\n************************************************************************************************************************"));
            console.log(colors.yellow.bold("\n" + movie.Title) + (" (" + movie.Year + ")"));
            console.log("\nIMDB Rating: " + movie.imdbRating);
            console.log("Rotten Tomatoes: " + movie.Ratings[1].Value);
            console.log("Country: " + movie.Country);
            console.log("Language: " + movie.Language);
            console.log(colors.yellow("\n" + movie.Plot));
            console.log("\nActors: " + movie.Actors);
            console.log(colors.blue("\n************************************************************************************************************************"));
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

    S.search({type: 'track', query: song, limit: 2}, function(err, data) {
        //Check for errors
        if (err) {
            return console.log("Error Occurred: " + err);
        };

        var band = data.tracks.items;

        //Display the first return song
        console.log(colors.blue("\n************************************************************************************************************\n"));
        console.log("------------MOST POPULAR------------".america);
        console.log("\n" + '"'.blue + (song + '"').blue + " by: " + colors.blue(band[0].album.artists[0].name)); 
        console.log("\nOff the album: " + colors.blue(band[0].album.name));
        console.log("\nCheck out a clip here!");
        console.log(colors.blue(band[0].preview_url));

        //Display the second return song
        console.log("\n------------RUNNER UP------------".america);
        console.log("\n" + '"'.yellow.bold + (song + '"').yellow.bold + " by: " + colors.yellow.bold(band[1].album.artists[0].name)); 
        console.log("\nOff the album: " + colors.yellow.bold(band[1].album.name));
        console.log("\nCheck out a clip here!");
        console.log(colors.yellow.bold(band[1].preview_url));
        console.log(colors.yellow.bold("\n****************************************************************************************************************"));

        //If we're running this function off of the prompt menu (not hardcoded argument), run the menu again
        if (!process.argv[2]) {
            inquirerMenu();
        }
    });
};

//This fx is used when the user doesn't in put a song
function aceOfBase() {

    //Log Ace of Base of the user doesn't input a song
    console.log(colors.blue("\n************************************************************************************************************\n"));
    console.log(colors.red("You didn't select a song.  Try this one instead!"));
    console.log(colors.blue("\nThe Sign") + " by: " + colors.blue("Ace of Base")); 
    console.log("\nOff the album: " + colors.blue('The Sign (US Album) [Remastered]'));
    console.log("\nCheck out a clip here!");
    console.log(colors.blue("https://p.scdn.co/mp3-preview/5ca0168d6b58e0f993b2b741af90ecc7c9b16893?cid=b8831b3b77394f828a1e4e53ab3d61fd"));
    console.log(colors.blue("\n************************************************************************************************************\n"));
};

//Function just builds out and prints a help menu object if the user needs it.
function helpMenu() {

    //Log the command
    fs.appendFile("log.txt", ["\n", process.argv[2]], function(err) {
        if (err) throw err;
    });

    //Log the menu options
    console.log("Remember, all commands are preceded with: " + colors.yellow.bold.italic("node liri \n"));
    console.log(colors.green("1. ") + colors.green.underline.bold("To search for a song in Spotify: "));
    console.log(colors.blue("\n     Enter command: " + (colors.yellow.bold("spotify-this-song"))));
    console.log(colors.blue("\n     Optional: " + (colors.yellow.bold("<Enter Movie Title w/ no brackets or quotes>"))));
    console.log(colors.blue("\n     Ex: " + (colors.yellow.bold("node liri spotify-this-song Only Wanna Be With You"))));
    console.log(colors.green("\n2. ") + colors.green.underline.bold("To search for a movie in OMDB: "));
    console.log(colors.blue("\n     Enter command: " + (colors.yellow.bold("movie-this"))));
    console.log(colors.blue("\n     Optional: " + (colors.yellow.bold("<Enter Movie Title (w/ no brackets or quotes)>"))));
    console.log(colors.blue("\n     Ex: " + (colors.yellow.bold("node liri movie-this House of 1000 Corpses"))));
    console.log(colors.green("\n3. ") + colors.green.underline.bold("To pull your or someone else's 20 most-recent Tweets: "));
    console.log(colors.blue("\n     Enter command: " + (colors.yellow.bold("get-tweets"))));
    console.log(colors.blue("\n     Optional: " + (colors.yellow.bold("<Enter user's EXACT Twitter Handle>"))));
    console.log(colors.blue("\n     Ex: " + (colors.yellow.bold("node liri get-tweets @realdonaldtrump"))));
    console.log(colors.green("\n4. ") + colors.green.underline.bold("To pull a song from the Txt file: "));
    console.log(colors.blue("\n     Enter command: " + (colors.yellow.bold("do-what-it-says"))));
    console.log(colors.blue("\n     Ex: " + (colors.yellow.bold("node liri do-what-it-says"))));
    console.log(colors.green("\n4. ") + colors.green.underline.bold("To have Liri walk you through: "));
    console.log(colors.blue("\n     Enter command: " + (colors.yellow.bold("node liri"))));
    console.log(colors.blue("\n     Ex: " + (colors.yellow.bold("node liri"))));
    console.log(colors.red("\n                           **********                           "));
    console.log(colors.red("\n             ***********************************                "));
    console.log(colors.red("\n****************************************************************"));
};

//Movie function when initiated from Inquirer
function liribotOmdb(movieReq) {
    
    //Log the command and movie name
    fs.appendFile("log.txt", ["\n", "movie-this", movieReq], function(err) {
        if (err) throw err;
    });

    var movieName = movieReq;

    //Checks for user input AFTER the command.  If none, enter in Mr. Nobody
    if (!movieReq) {
        console.log(colors.blue("\n************************************************************************************************************************"));
        console.log(colors.red("\nYou didn't pick a movie, so please enjoy this one instead!\n"));
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
            console.error(err);
            inquirerMenu();
            return;
        }

        else {

            //Change first letter of each word to uppercase
            var splitStr = movieName.toLowerCase().split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
            }
            // Directly return the joined string
            movieName = splitStr.join(' '); 

        //If the movie is found, log the pertinent info

            console.log(colors.blue("\n************************************************************************************************************************"));
            console.log(colors.yellow.bold("\n" + movie.Title) + (" (" + movie.Year + ")"));
            console.log("\nIMDB Rating: " + movie.imdbRating);
            console.log("Rotten Tomatoes: " + movie.Ratings[1].Value);
            console.log("Country: " + movie.Country);
            console.log("Language: " + movie.Language);
            console.log(colors.yellow("\n" + movie.Plot));
            console.log("\nActors: " + movie.Actors);
            console.log(colors.blue("\n************************************************************************************************************************"));
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
    //Add the song to the array so it doesn't just give you Ace of Base
    albumList[0] = songReq;

    //Search Spotify using the keys (S)
    S.search({type: 'track', query: songReq, limit: 2}, function(err, data) {
        //Check for errors
        if (err) {
            return console.log("Error Occurred: " + err);
        };

        //Put data info in a variable for clarity
        var band = data.tracks.items;
        
        //Check to make sure a song came back.  Run fx if not (it will display ace of base)
        if (albumList.length == 0) {
            checkDefault(albumList);
        }
        else {

            //Change first letter of each word to uppercase
            var splitStr = songReq.toLowerCase().split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
            }
            // Directly return the joined string
            songReq = splitStr.join(' '); 

            //If no errors, add an object into the albumList array for each album containing the song, up to 5.
            //Display the first return song
            console.log(colors.blue("\n************************************************************************************************************\n"));
            console.log("------------MOST POPULAR------------".america);
            console.log("\n" + '"'.blue + (songReq + '"').blue + " by: " + colors.blue(band[0].album.artists[0].name)); 
            console.log("\nOff the album: " + colors.blue(band[0].album.name));
            //Check to see if there's a preview URL.  If not, offer the full album
            if (band[0].preview_url != null) {
                console.log("\nCheck out a clip here!");
                console.log(colors.blue(band[0].preview_url));
            }
            else {
                console.log("\nNo preview available, but check out the full album w/ your Spotify account here!");
                console.log(colors.blue(band[0].external_urls.spotify));
                console.log(colors.blue.bold("\n****************************************************************************************************************"));
            }

            //Display the second return song - also catch the error if there is only one instance of that song
            if (band[1] != null) {
                console.log("\n------------RUNNER UP------------".america);
                console.log("\n" + '"'.yellow.bold + (songReq + '"').yellow.bold + " by: " + colors.yellow.bold(band[1].album.artists[0].name)); 
                console.log("\nOff the album: " + colors.yellow.bold(band[1].album.name));
                //Check to see if there's a preview available for the second song
                if (band[1].preview_url != null) {    
                    console.log("\nCheck out a clip here!");
                    console.log(colors.yellow.bold(band[1].preview_url));
                    console.log(colors.yellow.bold("\n****************************************************************************************************************"));
                }
                //If not, link to the full album
                else {
                    console.log("\nNo preview available, but check out the full album w/ your Spotify account here!");
                    console.log(colors.yellow(band[1].external_urls.spotify));
                    console.log(colors.yellow.bold("\n****************************************************************************************************************"));
                }             
            }
            else {
                console.log(colors.blue("\n*************************************************************************************************************\n"));
            }
        }
        // //Run a fx to make sure at least 1 result came back
        checkDefault(albumList, songReq);

        inquirerMenu();
    }); //End Spotify Search
}

//Twitter function when initiated from Inquirer
function liribotTwitter(handle) {

    //Log the command and movie name
    fs.appendFile("log.txt", ["\n", "get-tweets", handle], function(err) {
        if (err) throw err;
    });

    //Pre-Made fx from docs to req last 20 user tweets
    T.get("statuses/user_timeline", {screen_name: handle, count: 20}, function(error, tweets, response) {
        
        //Log the errors
        if(error) {
            console.log(error);
        } 
        else {
            //If no errors, get 10 most-recent tweets and loop through to fill out the log
            for (var i = 0; i < tweets.length; i++) {

                //Log the tweets
                console.log(colors.green("\n*********************** Tweet " + (i + 1) + " ***********************"));
                console.log(colors.cyan("\n" + tweets[i].text));
                console.log(colors.grey("\nTweeted at: " + tweets[i].created_at));

            };
            console.log(colors.green("\n********************** End Tweets **********************\n"));
        };
        inquirerMenu();
    });
};


