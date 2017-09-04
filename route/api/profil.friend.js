const router    = require('express').Router();
const Account     = require('../../model/accounts');
const authenticate = require('../../middleware/authenticate');

module.exports  = function(app){
    // CHERCHER
    router.get('/search/', (req, res, next) => {
        const query = req.query;

        Account.getFriendsList(req.user._id)
            .then((friends) => {
                const friendsId = friends.map((friend) => {
                    return friend._id;
                });
                
                return Account.searchFriends(friendsId, query.q, parseInt(query.l));
            })
            .then(friends => {
                res.json(friends);
            })
            .catch(err => {
                return next(err);
            });
    });

    // AFFICHER
    // router.get('/', (req, res, next) => {
    //     Account.getFriendsList(req.user._id, false)
    //         .then(friends => {
    //             res.json(friends);
    //         })
    //         .catch(err => {
    //             return next(err);
    //         });
    // });

    // AJOUTER
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
                return Account.addFriend(userId, friendId, 0);
            })
            .then(user => {
                return Account.addFriend(friendId, userId, 1)
                    .then((friend) => {
                        Account.addNotification(friendId, 'friends', userId);
                    });
            })
            .then(friend => {
                res.json({friend: true});
            })
            .catch(err => {
                return next(err);
            });
    });

    // SUPPRIMER
    router.delete('/:id', (req, res, next) => {
        var friendId = req.params.id;
        var userId = req.body.userId || req.user._id;

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

    // ACCEPTER
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
            .then(friends => {
                // Then friendship in both way (Self in second)
                return Account.acceptFriend(userId, friendId);
            })
            // .then(user => {
            //     // Update self data
            //     return authenticate.update(req, user);
            // })
            .then(friends => {
                res.json(true);
            })
            .catch(err => {
                return next(err);
            });
    });

    // REFUSER
    router.put('/:id/refuse/', (req, res, next) => {
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
                res.json(true);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}