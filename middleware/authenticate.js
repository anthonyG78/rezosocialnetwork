const conf      = require('../conf/conf')[process.env.NODE_ENV || 'production'];
const passport  = require('passport');
const Account   = require('../model/accounts');
const jwt       = require('jsonwebtoken');
const passportJwt = require("passport-jwt");
// const fs        = require('fs');
const jwtOptions    = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeader(),
  secretOrKey: conf.jwt.secretOrKey,
};

module.exports  = {
    strategy: () => {
        return new passportJwt.Strategy(jwtOptions, (payload, next) => {
        Account.getById(payload.id)
            .then(user => {
              next(null, user);
            })
            .catch(err => {
              next(err, false);
            });
        });
    },

    initialize: () => {
        return passport.initialize();
    },

    authenticate: () => {
        return passport.authenticate('jwt', { session: conf.jwt.session });
    },

    register: (req, res, next) => {
        return new Promise((resolve, reject) => {
            const body = req.body;
            const password = body.password;
            
            delete body.password;
            body.connected = true;

            Account.register(new Account(body), password, (err, account) => {
                if (err) {
                    return reject('Cet utilisateur existe déjà');
                }

                Account.authenticate()(body.email, password, (err, user) => {
                    if (err) {
                        return reject(err);
                    }

                    const token = jwt.sign({ id: user._id }, conf.jwt.secretOrKey);
                    resolve({ user: user, token: token });
                });
            });
        });
    },

    login: function(req, res, next) {
        return new Promise((resolve, reject) => {
            const body = req.body;
            Account.authenticate()(body.email, body.password, (err, user) => {
                if(err) {
                    return reject(err);
                }

                if(!user || user.state === false) {
                    return reject('Pseudo ou mot de passe incorrect');
                }

                Account.setConnectionStatus(user._id, true)
                    .then(result => {
                        const token = jwt.sign({ id: user._id }, conf.jwt.secretOrKey);
                        resolve({ user: result, token: token });
                    })
                    .catch(err => {
                        return reject(err);
                    });
            });
        });
    },

    logout: (req, res, next) => {
        return new Promise(function(resolve, reject){
            Account.setConnectionStatus(req.user._id, false)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    return reject(err);
                });
        });
    },
};