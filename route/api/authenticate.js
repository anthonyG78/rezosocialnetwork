const router    = require('express').Router();
const fs        = require('fs');
const authenticate   = require('../../middleware/authenticate');

module.exports  = (app) => {
    // const conf    = app.locals.conf;
    
    // REGISTER
    router.post('/register', (req, res, next) => {
        authenticate.register(req, res, next)
            .then((account) => {
                res.json(account);
            })
            .catch((err) => {
                return next(err);
            });
    });

    // // LOGIN
    router.post('/login', (req, res, next) => {
        authenticate.login(req, res, next)
            .then((user) => {
                res.json(user);
            })
            .catch((err) => {
                return next(err);
            });
    });

    // // LOGOUT
    router.all('/logout', (req, res, next) => {
        authenticate.logout(req, res, next)
            .then((data) => {
                res.json(true);
            })
            .catch((err) => {
                return next(err);
            });
    });

    return router;
}