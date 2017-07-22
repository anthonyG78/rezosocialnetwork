const router    = require('express').Router();
const passport  = require('passport');
const Account   = require('../model/accounts');
const fs        = require('fs');

module.exports  = function(app){
    var conf    = app.locals.conf;

    router.use(function (req, res, next){
        res.data = {
            user : req.session.user,
            layout : 'site',
        };
        next();
    });

    // router.all('/', (req, res, next) => {
    //     res.render('index', {
    //         user : false,
    //         title: 'accueil',
    //         assets : {
    //             css : true,
    //             js : true,
    //         },
    //     });
    // });

    HOME
    router.get('/', (req, res, next) => {
        if(req.user){
            res.redirect('/profil/accueil/');
            return;
        }

        res.render('index', {
            user : false,
            title: 'accueil',
            assets : {
                css : true,
                js : true,
            },
        });
    });

    // REGISTER
    router.post('/register', (req, res, next) => {
        var body        = req.body;

        Account.register(new Account(body), body.password, (err, account) => {
            if (err) {
                return res.render('index', {
                    body : body,
                    accountSchema : Account.schema.obj,
                    error : {
                        message : "Impossible d'enregistrer cet utilisateur",
                        form    : 'register',
                    }
                });
            }

            passport.authenticate('local')(req, res, () => {
                fs.mkdir('./file/'+account._id+'/');
                req.session.save((err) => {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/profil/accueil/');
                });
            });
        });
    });

    // LOGIN
    router.post('/login', function (req, res, next){
        passport.authenticate('local', function(err, user, info) {
            if (! user) {
                return res.render('index', {
                    body : req.body,
                    accountSchema : Account.schema.obj,
                    error : {
                        message : err || info.message,
                        form    : 'login',
                    }
                });
            }
            
            req.login(user, loginErr => {
                if (loginErr) {
                    return res.render('index', {
                        body : req.body,
                        accountSchema : Account.schema.obj,
                        error : {
                            message : loginErr.message,
                            form    : 'login',
                        }
                    });
                }

                res.redirect('/profil/accueil/');
            });      
        })(req, res, next);
    });

    // LOGOUT
    router.get('/logout', (req, res, next) => {
        if(!req.user){
            return res.redirect('/');
        }

        let userId  = req.user._id;

        req.logout();
        req.session.save((err) => {
            if (err) {
                return next(err);
            }

            Account.findOneAndUpdate({_id:userId}, {$set: {connected:false}}, function (err, data){
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });

    router.get('/ping', (req, res) => {
        res.status(200).send("pong!");
    });

    return router;
}