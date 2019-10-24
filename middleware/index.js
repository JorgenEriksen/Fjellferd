const Tur = require("../models/tur");
const Kommentar = require("../models/kommentar");

// all middleware her
let middlewareObj = {};

middlewareObj.sjekkBrukerEierskap = (req, res, next) => {
    //Hvis bruker er innlogget
    if (req.isAuthenticated()) {
        Tur.findById(req.params.id, (error, turFunnet) => {
            if (error) {
                res.redirect("back");
            } else {
                //Hvis pålogget bruker er den samme brukeren som "forfatter" av turen. 
                if (req.user._id.equals(turFunnet.forfatter.id)) { // Må bruke .equals() istedenfor == da req.user._id er en string og turFunnet.forfatter.id er et mongoose object.
                    next();
                    //Hvis bruker ikke er "forfatter" av turen
                } else {
                    res.redirect("back");
                }
            }
        });

        //Hvis bruker ikke er innlogget
    } else {
        res.redirect("back");
    }
}

middlewareObj.sjekkKommentarEierskap = (req, res, next) => {
    //Hvis bruker er innlogget
    if (req.isAuthenticated()) {
        Kommentar.findById(req.params.kommentar_id, (error, kommentarFunnet) => {
            if (error) {
                req.flash("error", "Fant ikke tur"); //Denne vil mest sannsynlig aldri vises
                res.redirect("back");
            } else {
                //Hvis brukeren eier kommentaren
                if (req.user._id.equals(kommentarFunnet.forfatter.id)) { // Må bruke .equals() istedenfor == da req.user._id er en string og turFunnet.forfatter.id er et mongoose object.
                    next();

                    //Hvis bruker ikke eier kommentaren
                } else {
                    req.flash("error", "Du eier ikke denne kommentaren"); //Denne vil mest sannsynlig aldri vises
                    res.redirect("back");
                }
            }
        });

        //Hvis bruker ikke er innlogget
    } else {
        req.flash("error", "Du må være logget inn først 2");
        res.redirect("back");
    }
}

middlewareObj.erLoggetInn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Du må være logget inn først");
    res.redirect("/logg-inn");
}

module.exports = middlewareObj;