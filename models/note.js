let mongoose = require("mongoose");

// ----------------- NOTE SCHEMA
let noteSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: true
    },

    body: {
        type: String,
        required: true
    }

});

let Note = module.exports = mongoose.model("Note", noteSchema);