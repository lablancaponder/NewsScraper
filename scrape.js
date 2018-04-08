
// ------------- DEPENDENCIES
const request = require("request");
const cheerio = require("cheerio");
const express = require("express");
const mongojs = require("mongojs");



// ------------- INITIALIZE EXPRESS
const app = express();


// ------------- DATABASE CONFIG
const databaseUrl = "crimeandcourts";
const collections = ["articles"];


// ------------- CONNECT MONGJS CONFIG TO DB VARIABLE
const db = mongojs(databaseUrl, collections);
db.on("error", error => {
    console.log("Database Error:", error);
});


// ------------- MAIN ROUTE
app.get("/", (req, res) => {
    res.send("hello World");
});


// ------------- RETRIEVE DATA FROM THE DB
app.get("/all", (req, res) => {

    // ------------- FIND ALL RESULTS FROM COLLECTION IN DB
    db.articles.find({}, (error, found) => {
        if(error) {
            console.log(error);
        }
        // ------------- IF NO ERRORS, SEND DATA TO BROWSER AS JSON
        else {
            res.json(found);
        }
    });
});

// ------------- SCRAPE DATA FROM SITE AND PLACE INTO DB
app.get("/scrape", (req, res) => {
    // ------------- MAKE REQUEST FROM BREAKFAST CLUB PAGE
    request("https://www.denverpost.com/news/crime-courts/", (error, response, html) => {

    // ------------- LOAD THE HTML BODY FROM REQUEST INTO CHEERIO
        const $ = cheerio.load(html);

        // ------------- FOR EACH ELEMENT UNDER "HEADER"
        $("h4.entry-title").each((i, element) => {


            // ------------- SAVE THE TEXT & HREF OF EACH LINK
            // ------------- ENCLOSED IN THE CURRENT ELEMENT (HEADER)
            const title = $(element).children("a").text();
            const link = $(element).children("a").attr("href");

            // ------------- IF THIS FOUND ELEMENT HAS BOTH TITLE AND LINK
            if (title && link) {
                // ------------- INSERT THE DATA IN THE ARTICLES TABLE OF THE DB
                db.articles.insert({
                    title: title,
                    link: link
                },
                (error, inserted) => {
                    if(error) {
                        console.log(error);
                    }
                    else {
                        console.log(inserted);
                    }
                
                });
            }
        });
    });
    // ------------- SEND A "SCRAPE COMPLETE" MESSAGE TO THE BROWSER
    res.send("Scrape Complete");
});

// ------------- LISTEN ON PORT 3000
app.listen(8080, () => {
    console.log("App running on port 8080...");
});


