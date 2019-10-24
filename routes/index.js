const express = require("express");
const router = express.Router();
const passport = require("passport");
const Bruker = require("../models/bruker");
const middleware = require("../middleware");

//viser registreringsskjema
router.get("/registrer", (req, res) => {
    res.render("registrer")
});

router.post("/registrer", (req, res) => {
    let nyBruker = new Bruker({
        username: req.body.username
    });
    Bruker.register(nyBruker, req.body.password, (error, bruker) => {
        if (error) {
            if(error.name == "UserExistsError"){
                req.flash("error", "Bruker '" + req.body.username + "' eksisterer allerede");
            } else {
                req.flash("error", "Du har skrevet inn et ugyldig brukernavn/passord");
            }
            res.redirect("/registrer");
        } else {
        passport.authenticate("local")(req, res, function () {
            req.flash("suksess", "Velkommen " + req.body.username + "!");
            res.redirect("/turer");
        });
         }
    });
});

//viser loginskjema
router.get("/logg-inn", (req, res) => {
    res.render("logg-inn");
})

//logg inn logikk
router.post("/logg-inn", passport.authenticate("local", {
    successRedirect: "/turer",
    failureFlash: 'Feil brukernavn/passord',
    failureRedirect: "/logg-inn"
}), (req, res) => {});

// logg ut route
router.get("/logg-ut", (req, res) => {
    req.logout();
    req.flash("suksess", "Du er nå logget ut!");
    res.redirect("/")
});



module.exports = router;