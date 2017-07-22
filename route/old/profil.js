const router    = require('express').Router();
const passport  = require('passport');
const Account   = require('../model/accounts');
const multer    = require('multer');
const upload    = multer({ dest: './tmp/'});
const fs        = require('fs');

module.exports  = function(app){
    var conf    = app.locals.conf;
    var posts   = [];
    var posts = [
        {
            user : {
                username : "toto",
                url : "/profil/1/",
                avatar : '',
            }, 
            image : "https://ep1.pinkbike.org/p5pb6403665/p5pb6403665.jpg",
            description : "Some quick example text to build on the card title and make up the bulk of the card's content.",
            commentCount : 3,
            since : Date.now(),
        },
        {
            user : {
                username : "lala",
                url : "/profil/1/",
                avatar : '',
            },
            image : "https://s-media-cache-ak0.pinimg.com/736x/89/ab/9c/89ab9c3e604dc70a24bd0d65f95f93b2.jpg",
            description : "Some quick example text to build on the card title.",
            commentCount : 1,
            since : Date.now(),
        },
        {
            user : {
                username : "lili",
                url : "/profil/1/",
                avatar : '',
            },
            image : "https://medias.lequipe.fr/img-photo-jpg/la-quatrieme-manche-de-la-coupe-du-monde-de-descente-se-deroule-ce-week-end-a-leogang/1500000000690139/0-960-480-70/b7cf9.jpg",
            description : "Some quick example text to build on the card title.",
            commentCount : 5,
            since : Date.now(),
        },
        {
            user : {
                username : "lulu",
                url : "/profil/1/",
                avatar : '',
            },
            image : "http://media.meltyxtrem.fr/article-3247675-ajust_930-f1465538281/top-20-des-plus-belles-photos-de-vtt-descente.jpg",
            description : "Some quick example text to build on the card title and make up the bulk of the card's content.",
            commentCount : 1,
            since : Date.now(),
        },
        {
            user : {
                username : "tata",
                url : "/profil/1/",
                avatar : '',
            },
            image : "https://static.downhill911.com/images/lapierre-dh-727-01.jpg",
            description : "Some quick example text to build on the card title and make up the bulk of the card's content.",
            commentCount : 12,
            since : Date.now(),
        },
        {
            user : {
                username : "tata",
                url : "/profil/1/",
                avatar : '',
            },
            image : "https://ep1.pinkbike.org/p5pb6403665/p5pb6403665.jpg",
            description : "Some quick example text to build on the card title and make up the bulk of the card's content.",
            commentCount : 0,
            since : Date.now(),
        },
    ];

    router.use(function (req, res, next) {
        if(!req.user){
            return res.redirect('/');
        }

        res.data = {
            user    : req.user,
            layout  : 'site',
            url     : req._parsedOriginalUrl,
        };

        next();
    });

    router.get(['/', '/accueil'], (req, res) => {
        res.render('profil-accueil', Object.assign(res.data, {
            title   : 'accueil',
            posts : posts,
            css     : true,
            js      : true,
            // data    : {
            //     posts : posts,
            // },
        }));
    });

    router.get('/actualite', (req, res) => {
        res.render('profil-actualite', {
            user : req.user,
            url : req._parsedOriginalUrl,
            title: 'actualite',
            posts: posts,
            assets : {
                css : true,
                js : true,
            },
            layout:"site"
        });
    });

    router.get('/infos', (req, res) => {
        res.render('profil-infos', {
            user : req.user,
            url : req._parsedOriginalUrl,
            title: 'info',
            assets : {
                css : true,
                js : true,
            },
            layout:"site"
        });
    });

    router.post('/infos/avatar/', upload.single('avatar'), (req, res, next) => {
        var response = {
            user : req.user,
            url : req._parsedOriginalUrl,
            title: 'info',
            assets : {
                css : true,
                js : true,
            },
            layout:"site"
        };

        if(!req.file){
            response.error = {
                message : 'Impossible de charger le fichier',
                form : 'avatar'
            };
            return res.render('profil-infos', response);
        } else if(req.file.size > 1000000){
            response.error = {
                message : 'Le fichier est trop lourd',
                form : 'avatar'
            };
            return res.render('profil-infos', response);
        }

        var path    = require('path');
        var ext     = path.extname(req.file.originalname);
        var userId  = req.user._id;

        fs.rename(req.file.path, './file/'+userId+'/avatar'+ext, function (){
            Account.findByIdAndUpdate(userId, { $set: { avatar: 'avatar'+ext }}, { new: false }, function (err, user) {
                if (err){
                    response.error = {
                        message : "Impossible d'enregistrer l'avatar",
                        form : 'avatar'
                    };
                    res.render('profil-infos', response);
                }

                // req.session.user = user;
                // req.session.save((err) => {
                //     if (err) {
                //         console.log('error')
                //         return next(err);
                //     }

                //     return res.redirect('/profil/infos/');
                // });
                req.logIn(user, function(error) {
                    if (!error) {
                        // successfully serialized user to session
                    }
                });
            });
        });
    }   );

    return router;
}