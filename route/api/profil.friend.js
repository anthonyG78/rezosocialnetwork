const router    = require('express').Router();
const Account     = require('../../model/accounts');
const authenticate = require('../../middleware/authenticate');

module.exports  = function(app){
    // FRIEND
    router.get('/', (req, res, next) => {
        Account.getFriendsList(req.user._id, false)
            .then(friends => {
                res.json(friends);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.post('/:id', (req, res, next) => {
        var friendId = req.params.id;
        var userId = req.user._id;

        Account.userExists(friendId)
            .then(friendExists => {
                if(friendExists === false){
                    throw "Cette personne n'existe pas";
                }
                
                return Account.hasFriendshipAlreadyRequested(userId, friendId);
            })
            .then(alreadyRequested => {
                if(alreadyRequested) {
                    throw "Cette personne a déjà été demandée en ami";
                }
                
                return Account.addFriend(userId, friendId);
            })
            .then(user => {
                return Account.addFriend(friendId, userId);
            })
            .then(friend => {
                res.json({friend: true});
            })
            .catch(err => {
                return next(err);
            });
    });

    router.delete('/:id', (req, res, next) => {
        var friendId = req.params.id;
        var userId = req.user._id;

        Account.userExists(friendId)
            .then(friendExists => {
                if(friendExists === false){
                    throw "Cette personne n'existe pas";
                }

                return Account.removeFriend(userId, friendId);
            })
            .then(user => {
                return Account.removeFriend(friendId, userId);
            })
            .then(friend => {
                res.json({friend: true});
            })
            .catch(err => {
                return next(err);
            });
    });

    router.put('/:id/accept/', (req, res, next) => {
        var friendId = req.params.id;
        var userId = req.user._id;

        Account.userExists(friendId)
            .then(friendExists => {
                if(friendExists === false){
                    throw "Cette personne n'existe pas";
                }

                // Friendship in one way (Friend first !)
                return Account.acceptFriend(friendId, userId);
            })
            .then(friend => {
                // Then friendship in both way (Self in second)
                return Account.acceptFriend(userId, friendId);
            })
            .then(user => {
                // Update self data
                return authenticate.update(req, user);
            })
            .then(user => {
                res.json(user);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.put('/:id/refuse/', (req, res, next) => {
        // Method DELETE - url '/friend/:id'
    });

    router.get('/search/', (req, res, next) => {
        var q = req.query.q;

        if(!q) {
            return next('Saisir le nom, prénom ou pseudo d\'un ami');
        }
        
        Account.searchUserByName(q)
            .then(friends => {
                res.json(friends);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}