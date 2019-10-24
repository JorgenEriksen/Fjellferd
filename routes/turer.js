const express = require("express");
const router = express.Router();
const Tur = require("../models/tur");
const Kommentar = require("../models/kommentar");
const middleware = require("../middleware");
const multer = require("multer");
const NodeGeocoder = require("node-geocoder");

let options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

let geocoder = NodeGeocoder(options);

let storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname); //lagrer bilde som datoen + filens orginalnavn
    }
});
let imageFilter = function (req, file, cb) {
    // Tar imot kun følgende filer som bilder
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Kun bildefiler er lov (jpg, jpeg, png og gif)"), false);
    }
    cb(null, true);
};
let upload = multer({
    storage: storage,
    fileFilter: imageFilter
})

const cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: "drfaap6yc",
    api_key: process.env.CLOUDINARY_API_KEY, //hentes fra .env
    api_secret: process.env.CLOUDINARY_API_SECRET //hentes fra .env
});

// INDEX - Viser alle turer
router.get("/", (req, res) => {
    Tur.find().then(alleTurer => {
        res.render("turer/turer", {
            turer: alleTurer
        })
    }).catch(error => {
        feilmelding(req, error);
    })
});


// CREATE - lagrer tur til databasen
router.post("/", middleware.erLoggetInn, upload.single("bilde"), (req, res) => {

    cloudinary.uploader.upload(req.file.path, function (result) {
        console.log(req.body.location);
        geocoder.geocode(req.body.location, function (err, data) {
            console.log(data);
            if (err || !data.length) {
                console.log(err);
                req.flash("error", "Ugyldig adresse");
                return res.redirect("back");
            }
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;

            //henter data fra form med body parser, og lagrer til databasen
            Tur.create({
                navn: req.body.navn,
                lengde: req.body.lengde,
                bilde: result.secure_url, //cloudinary secure_url (linken til bilde)
                beskrivelse: req.body.beskrivelse,
                forfatter: {
                    id: req.user._id,
                    brukernavn: req.user.username
                },
                location: location,
                lat: lat,
                lng: lng


            }).then(item => {
                console.log("tur laget:")
                console.log(item);
                res.redirect("turer")
            });
        })

    });

});

// NEW - viser form til a lage ny tur
router.get("/legg-til", middleware.erLoggetInn, (req, res) => {
    res.render("turer/leggtil.ejs")
})


// SHOW - Viser informasjon om en spesifikk tur 
router.get("/:id", (req, res) => {
    Tur.findById(req.params.id).populate("kommentarer").exec((error, turFunnet) => {
        if (error) {
            feilmelding(req, error);
            res.redirect("/turer");
        } else {
            res.render("turer/tur-info", {
                tur: turFunnet
            });
        }
    });
});

// EDIT - Viser skjema for å endre turen
router.get("/:id/endre", middleware.sjekkBrukerEierskap, (req, res) => {

    Tur.findById(req.params.id, (error, turFunnet) => { //egentlig ikke nødvendig å sjekke error da samme funksjon blir kjørt i sjekkBrukerEierskap().
        if (error) {
            feilmelding(req, error);
        } else {
            res.render("turer/endre", {
                tur: turFunnet
            });
        }
    });

});

// UPDATE - Oppdaterer turen
router.put("/:id", middleware.sjekkBrukerEierskap, (req, res) => {

    geocoder.geocode(req.body.tur.location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash("error", "Ugyldig adresse");
            return res.redirect("back");
        }
        req.body.tur.lat = data[0].latitude;
        req.body.tur.lng = data[0].longitude;
        req.body.tur.location = data[0].formattedAddress;

        Tur.findByIdAndUpdate(req.params.id, req.body.tur, (error, oppdatertTur) => {

            if (error) {
                feilmelding(req, error);
                res.redirect("/turer");
            } else {
                res.redirect("/turer/" + req.params.id);
            }
        })

    })
})


// DESTROY - Fjerner turen
router.delete("/:id", middleware.sjekkBrukerEierskap, (req, res) => {

    //Sletter kommentarene til turen
    Tur.findById(req.params.id, (error, turFunnet) => {
        turFunnet.kommentarer.forEach(e => {
            Kommentar.findByIdAndRemove(e, (error) => {
                if (error) {
                    feilmelding(req, error);
                    res.redirect("/turer");
                }
            });
        });
    });

    //sletter turen
    Tur.findByIdAndRemove(req.params.id, (error) => {
        if (error) {
            feilmelding(req, error);
            res.redirect("/turer");
        } else {
            res.redirect("/turer");
        }
    })
});

function feilmelding(req, error) {
    console.log(error);
    req.flash("error", "Noe gikk galt");
}


module.exports = router;