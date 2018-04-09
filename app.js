const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
// const mongojs = require("mongojs");
// const request = require("request");
const request = require("cheerio");
const bodyParser = require("body-parser");


mongoose.Promise = global.Promise;

// ----------------- CONNECT TO DB
// mongoose.connect("mongodb://localhost/crimeandcourts");


var MONGODB_URI = process.env.MONGODB_URI || "mongolab-animate-94406";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

let db = mongoose.connection;

// ----------------- CHECK DB CONNECTION
db.once("open", () => {
    console.log("Connected to MongoDB");
})
db.on("error", (error) =>{
    console.log(error);
})

// ----------------- INITIATE APP
const app = express();

let Article = require("./models/article");
let Note = require("./models/note");

// ----------------- LOAD VIEW ENGINE

// ----------------- POINT TO THE VIEWS FOLDER
app.set("views", path.join(__dirname, "views"));
// ----------------- SET VIEW ENGINE TO PUG
app.set("view engine", "pug");



// ----------------- BODY PARSER MIDDLEWARE
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


//----------------- HOME ROUTE
app.use(express.static(path.join(__dirname, "public")));



//----------------- HOME ROUTE
app.get("/", (req, res) => {
    Article.find({}, (error, articles, notes) => {
        if(error) {
            console.log(error);

        } else {
                   
    // ----------------- RENDER INDEX.PUG FROM VIEWS FOLDER
    res.render("index", {
        title:"Articles",
        articles: articles,
        notes: notes
    });

        }
 

    });

});


// ----------------- NOTES ROUTE

app.get("/notes", (req, res) => {

    Note.find({}, (error, notes) => {
          if(error) {
            console.log(error);

        } else {

     // ----------------- RENDER NOTES.PUG FROM VIEWS FOLDER   
    res.render("notes", {
        title: "Notes",
        notes: notes

    });
}
        
    });

});

// ----------------- GET SINGLE NOTE
app.get("/note/:id", (req, res) => {
    Note.findById(req.params.id, (error, note) => {
        res.render("note", {
            note:note
        });
    });
});


// ----------------- ADD ROUTE FOR NOTES
app.get("/notes/add", (req, res) =>{
    res.render("add_note", {
        title:"Add Note"
    });
});


// ----------------- ADD SUBMIT POST ROUTE FOR NOTES
app.post("/notes/add", (req, res) => {
    let note = new Note();
    
    note.title = req.body.title;
    note.author = req.body.author;
    note.body = req.body.body;

    note.save( (error) => {
        if(error) {
            console.log(error);
            return;
        } 
        else {
        res.redirect("/notes");
        }
    });
   
});


// // ----------------- ADD ROUTE FOR ARTICLES
// app.get("/articles/add", (req, res) =>{
//     res.render("add_article", {
//         title:"Add Article"
//     });
// });

//------------- SCRAPE DATA FROM SITE AND PLACE INTO DB
app.get("/scrape", (req, res) => {
    // ------------- MAKE REQUEST FROM BREAKFAST CLUB PAGE
    request("https://www.denverpost.com/news/crime-courts/", (error, response, html) => {

    // ------------- LOAD THE HTML BODY FROM REQUEST INTO CHEERIO
        const $ = cheerio.load(html);

        // ------------- FOR EACH ELEMENT UNDER "HEADER"
        $("h4.entry-title").each((i, element) => {


            // ------------- SAVE THE TEXT & HREF OF EACH LINK
            // ------------- ENCLOSED IN THE CURRENT ELEMENT (HEADER)
            let title = $(element).children("a").text();
            let link = $(element).children("a").attr("href");

            // ------------- IF THIS FOUND ELEMENT HAS BOTH TITLE AND LINK
            if (title && link) {
                // ------------- INSERT THE DATA IN THE ARTICLES TABLE OF THE DB
                db.articles.insert(
                    {
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






// ----------------- START SERVER
app.listen(3000, () => {
    console.log("Server started on port 3000...");
});
