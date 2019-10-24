const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const BrukerSchema = new mongoose.Schema({
    username: String,
    password: String
});

BrukerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Bruker", BrukerSchema);