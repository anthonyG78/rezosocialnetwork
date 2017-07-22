const router    = require('express').Router();
// const passport  = require('passport');
// const Account   = require('../model/accounts');

module.exports  = function(app){

    router.get(['/', '/accueil/'], (req, res) => {
        res.render('accueil', {
            user : user,
            title: 'accueil',
            posts: posts,
            assets : {
                css : true,
                js : true,
            },
            layout:"site"
        });
    });

    // router.get('/register', (req, res) => {
    //     res.render('register', { });
    // });

    // router.post('/register', (req, res, next) => {
    //     Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
    //         if (err) {
    //           return res.render('register', { error : err.message });
    //         }

    //         passport.authenticate('local')(req, res, () => {
    //             req.session.save((err) => {
    //                 if (err) {
    //                     return next(err);
    //                 }
    //                 res.redirect('/');
    //             });
    //         });
    //     });
    // });


    // router.get('/login', (req, res) => {
    //     res.render('login', { user : req.user, error : req});
    // });

    // router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: false }), (req, res, next) => {
    //     req.session.save((err) => {
    //         if (err) {
    //             return next(err);
    //         }

    //         // Account.findOneAndUpdate({_id:req.user._id}, {$set: {connected:1}}, function(err, data){
    //         //     if (err) {
    //         //         return next(err);
    //         //     }
    //         //     res.redirect('/');
    //         // });
    //         res.redirect('/');
    //     });

    // });

    // router.get('/logout', (req, res, next) => {
    //     let userId = req.session.user._id;

    //     req.logout();
    //     req.session.save((err) => {
    //         if (err) {
    //             return next(err);
    //         }

    //         Account.findOneAndUpdate({_id:userId}, {$set: {connected:0}}, function(err, data){
    //             if (err) {
    //                 return next(err);
    //             }
    //             res.redirect('/');
    //         });
    //         // res.redirect('/');
    //     });
    // });

    // router.get('/ping', (req, res) => {
    //     res.status(200).send("pong!");
    // });

    return router;
}