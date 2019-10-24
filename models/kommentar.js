const mongoose = require("mongoose");

const kommentarSchema = new mongoose.Schema({
    tekst: String,
    forfatter: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bruker"
        },
        brukernavn: String
    }
});

const Kommentar = mongoose.model("Kommentar", kommentarSchema)
module.exports = Kommentar;