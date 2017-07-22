const router    = require('express').Router();
const authenticate   = require('../middleware/authenticate');
const path = require('path');

module.exports  = (app) => {
    const conf    = app.locals.conf;

    router.all('/ping', (req, res, next) => {
        res.send('pong');
    });

    // REGISTER
    router.post('/register', (req, res, next) => {
        authenticate.register(req, res, next)
            .then((account) => {
                res.redirect('/');
            })
            .catch((err) => {
                return next(err);
            });
    });

    // LOGIN
    router.post('/login', (req, res, next) => {
        authenticate.login(req, res, next)
            .then((user) => {
                res.redirect('/');
            })
            .catch((err) => {
                return next(err);
            });
    });

    // LOGOUT
    router.all('/logout', (req, res, next) => {
        authenticate.logout(req, res, next)
            .then((data) => {
                res.redirect('/');
            })
            .catch((err) => {
                return next(err);
            });
    });

    // ALL ROUTES
    router.get('*', (req, res, next) => {
        if(req.isAuthenticated()){
            res.render('index', {
                user: req.user,
                title: 'accueil',
                siteName: conf.app.siteName,
            });
        }else{
            res.render('index-home', {
                user: false,
                title: 'accueil',
                siteName: conf.app.siteName,
                slogan: conf.app.slogan,
                shortSlogan: conf.app.shortSlogan,
            });
        }
    });

    return router;
}