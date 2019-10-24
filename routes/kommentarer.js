const express = require("express");
const router = express.Router({mergeParams: true});
const Tur = require("../models/tur");
const Kommentar = require("../models/kommentar");
const middleware = require("../middleware");


// NEW
router.get("/legg-til", middleware.erLoggetInn, (req, res) => { 
    Tur.findById(req.params.id, (error, turFunnet) => {
        if (error) {
            feilmelding(req, error);
            res.redirect()
        } else {
            res.render("kommentarer/leggtil", {
                tur: turFunnet
            });
        }
    })
})

// CREATE
router.post("/", middleware.erLoggetInn, (req, res) => {
    Tur.findById(req.params.id, (error, turFunnet) => {
        if (error) {
            feilmelding(req, error);
            res.redirect("back");
        } else {
            Kommentar.create(req.body.kommentar, (error, kommentar) => {
                if (error) {
                    feilmelding(req, error);
                } else {
                    kommentar.forfatter.id = req.user._id;
                    kommentar.forfatter.brukernavn = req.user.username;
                    kommentar.save();
                    turFunnet.kommentarer.push(kommentar);
                    turFunnet.save();
                    req.flash("suksess", "Kommentar lagret!");
                    res.redirect("/turer/" + turFunnet._id);
                }
            })
        }
    })
})

// EDIT
router.get("/:kommentar_id/endre", middleware.sjekkKommentarEierskap, (req, res)=>{
    Tur.findById(req.params.id, (error, turFunnet) => {
        if (error) {
            feilmelding(req, error);
            res.redirect("/turer");
        } else {
            Kommentar.findById(req.params.kommentar_id, (error, kommentarFunnet)=>{
                if (error) {
                    feilmelding(req, error);
                    res.redirect("back");
                } else {
                    res.render("kommentarer/endre", {tur: turFunnet, kommentar: kommentarFunnet});
                }
            });    
        }
    });
});

// UPDATE
router.put("/:kommentar_id", middleware.sjekkKommentarEierskap, (req, res)=>{
    Kommentar.findByIdAndUpdate(req.params.kommentar_id, req.body.kommentar, (error, oppdatertKommentar)=>{
        if(error){
            feilmelding(req, error);
            res.redirect("back");
        } else {
            req.flash("suksess", "Kommentaren ble oppdatert");
            res.redirect("/turer/" + req.params.id);
        }
    });
});

// DESTROY
router.delete("/:kommentar_id", middleware.sjekkKommentarEierskap, (req, res)=>{
 Kommentar.findByIdAndRemove(req.params.kommentar_id, (error)=>{
     if(error){
        feilmelding(req, error);
        res.redirect("back");
     } else {
        req.flash("suksess", "Kommentaren ble slettet");
        res.redirect("/turer/" + req.params.id);
     }
 })
})

function feilmelding(req, error){
    console.log(error);
    req.flash("error", "Noe gikk galt");
}

module.exports = router;
