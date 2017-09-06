const router    = require('express').Router();
const fs        = require('fs');
const authenticate   = require('../../middleware/authenticate');
const passport  = require('passport');
const Account     = require('../../model/accounts');
const Mailer = require('../../lib/Mailer');
const conf       = require('../../conf/conf')[process.env.NODE_ENV || 'production'];

module.exports  = (app) => {
    // const conf    = app.locals.conf;
    
    // REGISTER
    router.post('/register', (req, res, next) => {
        authenticate.register(req, res, next)
            .then(data => {
                const user = data.user;
                Mailer.sendMail({
                    from: conf.nodemailer.auth.user,
                    to: user.email,
                    subject: conf.app.name + ' - y a du nouveau !',
                    html: require('../../views/mailNewNotification')({
                        title: 'Bienvenue',
                        notification: ' est arrivé dans la zone',
                        message: 'Vous pouvez voir votre profil et décrouvrir d\'autres membres sur REZO',
                        sender: user,
                        user: user,
                        action: {
                            url: conf.server.domain + '/profil',
                            label: 'voir mon profil', 
                        },
                        app: {
                            name: conf.app.name,
                            url: conf.server.domain,
                        },
                    }),
                });
                return data;
            })
            .then((data) => {
                res.json(data)
            })
            .catch((err) => {
                return next(err);
            });
    });

    // // LOGIN
    router.post('/login', (req, res, next) => {
        authenticate.login(req, res, next)
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                return next(err);
            });
    });

    // LOGOUT
    router.post('/logout', authenticate.authenticate(), (req, res, next) => {
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