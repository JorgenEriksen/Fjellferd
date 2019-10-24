//imports
require("dotenv").config({path: __dirname + "/.env"})
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const db_navn = "FjellFerd";
mongoose.connect("mongodb+srv://james123:bond123@cluster0-n50dj.gcp.mongodb.net/" + db_navn + "?retryWrites=true&w=majority", {
    useNewUrlParser: true
});
mongoose.set("useCreateIndex", true); //pga feilmeldingen: DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead
mongoose.set("useFindAndModify", false); //pga DeprecationWarning her og. https://mongoosejs.com/docs/deprecations.html#-findandmodify-

//models
const Kommentar = require("./models/kommentar");
const Tur = require("./models/tur");
const Bruker = require("./models/bruker");

//routes
const kommentarRoutes = require("./routes/kommentarer");
const turRoutes = require("./routes/turer");
const indexRoutes = require("./routes/index");

//seed
// const seedDB = require("./seeds");
// seedDB();

//konfigurasjoner
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use("/css", express.static("css"));
app.use("/assets", express.static("assets"));
app.use("/script", express.static("script"));
app.use(methodOverride("_method"));
app.use(flash()); //Viktig at denne er før passport konfigurasjonen

//Passport konfigurasjoner
app.use(require("express-session")({
    secret: "dette er en hemmelig setning",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Bruker.authenticate()));
passport.serializeUser(Bruker.serializeUser());
passport.deserializeUser(Bruker.deserializeUser());

app.use((req, res, next) => {
    res.locals.bruker = req.user; //lager bruker variabelen som blir med hver gang en side blir "renderet"
    res.locals.error = req.flash("error"); //til evt. error melding som blir vist nederst i header.ejs. 
    res.locals.suksess = req.flash("suksess"); //til evt. suksess melding som blir vist nederst i header.ejs. 
    next();
})

//Landingsiden
app.get("/", (req, res) => {
    res.render("front");
}).listen(1337, "127.0.0.1"); //Denne må endres senere

app.use("/", indexRoutes);
app.use("/turer", turRoutes);
app.use("/turer/:id/kommentarer", kommentarRoutes);

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("FjellFerd serveren har startet")
})