const router    = require('express').Router();
const Discussion     = require('../../model/discussion');
const Account     = require('../../model/accounts');

module.exports  = function(app){
    // Add a new discussion
    router.post('/', (req, res, next) => {
        var discussion = req.body.discussion;
        var usersId = req.body.usersId;
        
        usersId.push(req.user._id);

        if (usersId.length < 2) {
            return next('Il n\'y a pas assez de particpant à cette discussion');
        }

        if (!('messages' in discussion) || discussion.messages.length === 0) {
            return next('Aucun message dans cette discussion');
        }

        // Attach an owner to this discussion
        discussion.ownerId = req.user._id;

        // First, add this discussion in the Discussion collection
        Discussion.addDiscussion(discussion)
            .then(discussion => {
                // And then, reference it at all users concerned
                return Account.addDiscussion(usersId, discussion._id);
            })
            .then(discussionId => {
                res.json(discussion);
            })
            .catch(err => {
                return next(err);
            });
    });

    // Get all User discussions
    router.get('/', (req, res, next) => {
        Account.getDiscussions(req.user._id)
            .then(discussions => {
                res.json(discussions);
            })
            .catch(err => {
                next(err);
            });
    });

    // Get a particular discussion
    router.get('/:id', (req, res, next) => {
        var discussionId = req.params.id;

        Account.getDiscussions(req.user._id)
            .then(discussions => {
                const mongoose = require('mongoose');
                var exists = false;
                discussions.forEach(discussion => {
                    if(discussion._id == discussionId) {
                        exists = true;
                    }
                });
                console.log(exists);
                res.json(discussions);
            })
            .catch(err => {
                console.log(err);
                return next(err);
            });

        return;

        // Check if user reference this discussion
        Account.hasDiscussion(req.user._id, discussionId)
            .then(hasDiscussion => {
                if(hasDiscussion === false) {
                    throw new Error("La discussion n'existe pas");
                }

                return Discussion.getDiscussion(discussionId);
            })
            .then(discussion => {
                res.json(discussion);
            })
            .catch(err => {
                return next(err);
            });
    });

    // Remove a particular discussion
    router.delete('/:id', (req, res, next) => {
        var discussionId = req.params.id;
        var userId = req.user._id;
        var discussion;

        Account.hasDiscussion(userId, discussionId)
            .then(hasDiscussion => {
                if(hasDiscussion === false) {
                    throw new Error("Impossible de suuprimer une discussion à la quelle vous ne participez pas");
                }

                // Delete reference of the discussion in User 
                return Account.removeDiscussion(userId, discussionId);
            })
            .then(discussionId => {
                return Discussion.getDiscussion(discussionId);
            })
            .then(discussion => {
                // If the user is the owner/creator of the discussion
                if(userId === discussion.ownerId.toString()) {
                    // Discussion is disabled/closed
                    return Discussion.closeDiscussion(discussionId);
                }
            })
            .then(discussion => {
                res.json(discussion);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}