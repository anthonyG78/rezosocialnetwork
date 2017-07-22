const router    = require('express').Router();
// const passport  = require('passport');
// const Account   = require('../model/accounts');

module.exports  = function(app){
    router.get('/actualite', (req, res) => {
        res.render('profil-actualite', {
            user : user,
            title: 'actualite',
            posts: posts,
            assets : {
                css : true,
                js : true,
            },
            layout:"site"
        });
    });

    return router;
}