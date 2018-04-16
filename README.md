# LIRI Node App
Liri Node App Week 10 Assignment

## HOW TO USE IT

* Open the liri.js document in your command prompt;
* To execute a function, enter 'node liri' in the command prompt (no quotes) followed by one of the following 5 functions:

    1. **spotify-this-song**
        - This function will allow you to search for a song name in Spotify;
        - It will return the top 5 results and provide:
            * The Band's Name;
            * A preview link for you to sample the song; and
            * The Title of the Album
        - Ex command line --> node liri spotify-this-song Ride the Lightning
    1. **get-tweets**
        - This function will pull back 20 tweets from one user
        - If you want **YOUR** 20 most-recent tweets:
            - Simply enter the command
            - Ex command line --> node liri get-tweets
        - If you want 20 tweets from **ANOTHER USER**:
            - You'll need the user's Twitter handle and you'll add it after the command
            - Ex command line --> node liri get-tweets realdonaldtrump
    1. **movie-this**
        - This will run a search for a movie in the OMDB database;
        - It will return the movie title; release year; IMDB Rating; Rotten Tomatoes Rating; Country of Filming; Language; Plot; and Actors
        - Ex command line --> node liri movie-this Fear and Loathing in Las Vegas
    1. **do-what-it-says**
        - This will pull a command from the random.txt document and execute accordingly
        - Ex command line --> node liri do-what-it-says
    1. **help**
        - Menu to explain each of the command options and the syntax
        - Ex command line --> node liri help
* Each command entered will log a new line in the log.txt file.  This will indicate the command and the search query (when applicable)