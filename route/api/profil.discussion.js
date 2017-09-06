const router    = require('express').Router();
const Discussion     = require('../../model/discussion');
const Account     = require('../../model/accounts');
const mongoose      = require('mongoose');
const Access = require('../../lib/Access');
const Mailer = require('../../lib/Mailer');
const conf       = require('../../conf/conf')[process.env.NODE_ENV || 'production'];

module.exports  = function(app){
    // Add a new discussion
    router.post('/', (req, res, next) => {
        var discussion = Object.assign({}, req.body);
        var userId = req.user._id.toString();
        var usersId = req.body.usersId.slice(0);

        // console.log(usersId, req.body.usersId);
        usersId.push(userId);

        if (usersId.length < 2) {
            return next('Il n\'y a pas assez de particpant à cette discussion');
        }

        if (!('message' in discussion)) {
            return next('Aucun message dans cette discussion');
        }

        // Attach an owner to this discussion
        discussion.ownerId = userId;
        discussion.messages = [{userId: userId, text: discussion.message}];
        discussion.usersId = usersId;
        discussion.dateMaj = Date.now();

        Access.createDiscussion(req.user, req.body.usersId)
            .then(() => {
                // First, add this discussion in the Discussion collection
                return Discussion.addDiscussion(discussion);
            })
            .then(_discussion => {
                discussion = _discussion;
                // And then, reference it at all users concerned
                return Account.addDiscussion(usersId, discussion._id).then(() => {
                    let sender = null;

                    Account.getById(usersId)
                        .then((_sender) => {
                            sender = _sender;
                            return Account.getByIds(req.body.usersId);
                        })
                        .then((users) => {
                            users.forEach((user) => {
                                Mailer.sendMail({
                                    from: conf.nodemailer.auth.user,
                                    to: user.email,
                                    subject: conf.app.name + ' - y a du nouveau !',
                                    html: require('../../views/mailNewNotification')({
                                        title: 'Nouvelle discussion',
                                        notification: ' a ouvert une nouvelle discussion.',
                                        message: discussion.subject,
                                        sender: sender,
                                        user: user,
                                        action: {
                                            url: conf.server.domain + '/discussion/' + discussion.id,
                                            label: 'voir la discussion', 
                                        },
                                        app: {
                                            name: conf.app.name,
                                            url: conf.server.domain,
                                        },
                                    }),
                                });
                            });
                        });
                    Account.addNotificationFor(req.body.usersId, 'discussions', discussion._id);
                });
            })
            .then(discussionId => {
                res.json(discussion);
            })
            .catch(err => {
                return next(err);
            });
    });

    // Get all User discussions
    // router.get('/', (req, res, next) => {
    //     Account.getDiscussions(req.user._id)
    //         .then(discussions => {
    //             res.json(discussions);
    //         })
    //         .catch(err => {
    //             return next(err);
    //         });
    // });

    // Get a particular discussion
    // router.get('/:id', (req, res, next) => {
    //     var discussionId = req.params.id;

    //     Account.getDiscussions(req.user._id)
    //         .then(discussions => {
    //             var exists = false;
    //             discussions.forEach(discussion => {
    //                 if(discussion._id == discussionId) {
    //                     exists = true;
    //                 }
    //             });
    //             // console.log(exists);
    //             res.json(discussions);
    //         })
    //         .catch(err => {
    //             return next(err);
    //         });
    // });

    // Remove a particular discussion
    router.delete('/:id', (req, res, next) => {
        var discussionId = req.params.id;
        var userId = req.user._id;

        Access.deleteDiscussion(req.user, discussionId)
            // .then(() => {
            //     return Account.hasDiscussion(userId, discussionId);
            // })
            // .then(hasDiscussion => {
            //     if(hasDiscussion === false) {
            //         throw new Error("Impossible de supprimer une discussion à la quelle vous ne participez pas");
            //     }

            //     // Delete reference of the discussion in User 
            //     return Account.removeDiscussion(userId, discussionId);
            // })
            .then(() => {
                return Account.removeDiscussion(userId, discussionId);
            })
            .then(discussionId => {
                return Discussion.getDiscussion(discussionId);
            })
            .then(discussion => {
                const usersId = discussion.usersId;

                if(usersId.length <= 2) {
                    return Account.removeDiscussion(usersId, discussionId).then(() => {
                        // Delete discussion if only one user is present
                        return Discussion.removeDiscussion(discussionId)
                            .then(() => {
                                return Account.deleteNotification('discussions', discussionId);
                            });
                    });
                } else {
                    // Delete the user ID of discussion data
                    usersId.splice(usersId.indexOf(userId), 1);
                    return Discussion.updateDiscussion(discussionId, discussion);
                }
            })
            // .then(() => {
            //     return Discussion.pullUserFromDiscussion(userId);
            // })
            .then(discussion => {
                res.json(true);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.post('/:id/message/', (req, res, next) => {
        const discussionId = req.params.id;

        if(!req.body.message) {
             return next('Aucun message');
        }

        Access.updateDiscussion(req.user, discussionId)
            .then(() => {
                return Discussion.addMessage(req.user._id, discussionId, req.body.message);
            })
            .then(discussion => {
                const index = discussion.usersId.indexOf(req.user._id);
                discussion.usersId.splice(index, 1);
                
                Account.addNotificationFor(discussion.usersId, 'discussions', discussion._id);
                res.json(discussion);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}