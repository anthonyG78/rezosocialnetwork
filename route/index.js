const router    = require('express').Router();
const authenticate   = require('../middleware/authenticate');
const path = require('path');

module.exports  = (app) => {
    const conf    = app.locals.conf;


    router.all('/ping', (req, res, next) => {
        res.send('pong');
    });

    router.get('*', (req, res, next) => {
        res.sendFile(path.join(__dirname, '/../', conf.client.path));
    });

    return router;
}