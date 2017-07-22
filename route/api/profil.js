const router    = require('express').Router();
const Posts     = require('../../model/post');
const Account     = require('../../model/accounts');
const mongoose = require('mongoose');
const authenticate = require('../../middleware/authenticate');

module.exports  = function(app){
    var conf    = app.locals.conf;

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

    router.use('/post', require('./profil.post')(app));
    router.use('/friend', require('./profil.friend')(app));
    router.use('/discussion', require('./profil.discussion')(app));

    return router;
}