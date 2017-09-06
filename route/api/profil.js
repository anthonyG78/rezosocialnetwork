const router    = require('express').Router();
const Posts     = require('../../model/post');
const Discussion     = require('../../model/discussion');
const Account     = require('../../model/accounts');
const mongoose = require('mongoose');
const authenticate = require('../../middleware/authenticate');
const passport  = require('passport');
const Access = require('../../lib/Access');

module.exports  = function(app){
    var conf    = app.locals.conf;

    router.post('/ping', (req, res, next) => {
        // console.log(req.user);
        res.json({ ping: true });
    });

    // ACCUEIL
    router.get('/accueil', (req, res, next) => {
        var ids = req.user.friends.map(friend => {
            return mongoose.Types.ObjectId(friend.userId);
        });

        ids.push(mongoose.Types.ObjectId(req.user._id));

        Posts.getPostsByUsersIds(ids)
            .then(posts => {
                res.json(posts);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.get('/search/', (req, res, next) => {
        const query = req.query;

        Account.searchUserByName(query.q, parseInt(query.l))
            .then(friends => {
                res.json(friends);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.use('/notification', require('./profil.notification')(app));
    router.use('/post', require('./profil.post')(app));
    router.use('/friend', require('./profil.friend')(app));
    router.use('/discussion', require('./profil.discussion')(app));

    // MOFIFIE ACCOUNT
    router.put('/:id', (req, res, next) => {
        const userId = req.params.id || req.user._id;

        Access.updateUser(req.user, userId)
            .then(() => {
                return Account.updateProfil(userId, req.body);
            })
            .then((profil) => {
                res.json(profil);
            })
            .catch(err => {
                return next(err);
            });
    });

    // SUPPRIME ACCOUNT
    router.delete('/:id', (req, res, next) => {
        const userId = req.params.id || req.user._id;

        Access.deleteUser(req.user, userId)
            .then(() => {
                return Account.desactiveProfil(userId);
                // return Account.deleteAllNotificationFrom(userId);
            })
            // .then(() =>{
            //     return Account.deleteProfil(userId);
            // })
            // .then((data) => {
            //     return Posts.removePostByUserId(userId);
            // })
            // .then((data) => {
            //     return Discussion.pullUserFromDiscussion(userId);
            // })
            .then((data) => {
                res.json(true);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}