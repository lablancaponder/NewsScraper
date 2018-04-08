let mongoose = require("mongoose");

// ----------------- NOTE SCHEMA
let articleSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    }

});

let Article = module.exports = mongoose.model("Article", articleSchema);