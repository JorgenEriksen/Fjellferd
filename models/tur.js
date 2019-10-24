const mongoose = require("mongoose");

//Tur schema
const turSchema = new mongoose.Schema({
    navn: String,
    lengde: Number,
    bilde: String,
    beskrivelse: String,
    location: String,
    lat: Number,
    lng: Number,
    forfatter: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bruker"
        },
        brukernavn: String
    },
    kommentarer: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Kommentar"

        }
    ]
});

const Tur = mongoose.model("tur", turSchema);

module.exports = Tur;