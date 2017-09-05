const router    = require('express').Router();
const Posts     = require('../../model/post');
const Account   = require('../../model/accounts');
const Access = require('../../lib/Access');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anthony.guyot78@gmail.com',
        pass: '80830308@78',
    }
});

module.exports  = function(app){
    // POST
    router.get('/', (req, res, next) => {
        Account.getPosts(req.user._id)
            .then(posts => {
                res.json(posts);
            })
            .catch(err => {
                return next(err);
            })
    });
    
    // AJOUTE
    router.post('/', (req, res, next) => {
        var post = req.body;
        const fromUserId = req.user._id;
        const toUserId = post.toUserId;

        if(!toUserId) {
            return next('Destinataire non renseigné');
        }

        post.fromUserId = fromUserId;

        Access.createPost(req.user, toUserId)
            .then(() => {
                return Posts.addPost(post);
            })
            .then(_post => {
                post = _post;
                Account.addPost([fromUserId, toUserId], post._id);
            })
            .then(modified => {
                if (fromUserId.toString() !== post.toUserId.toString()) {
                    return Account.getById(toUserId)
                        .then((user) => {
                            const mailOptions = {
                                from: 'anthony.guyot78@gmail.com',
                                to: user.email,
                                subject: 'REZO - nouveau post !',
                                text: 'Bonjour '+user.username+'Un post nouveau est arrivé !',
                            };
                            transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                        });
                    Account.addNotification(post.toUserId, 'posts', post._id);
                }

                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });

    // AFFICHE
    // router.get('/:id', (req, res, next) => {
    //     Posts.getPost(req.params.id)
    //         .then(post => {
    //             res.json(post);
    //         })
    //         .catch(err => {
    //             return next(err);
    //         });
    // });

    // MODIFIE
    router.put('/:id', (req, res, next) => {
        const postId = req.params.id;

        Access.updatePost(req.user, postId)
            .then(() => {
                Posts.updatePost(req.params.id, req.body)
            })
            .then(post => {
                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });

    // SUPPRIME
    router.delete('/:id', (req, res, next) => {
        const postId = req.params.id;

        Access.deletePost(req.user, postId)
            .then(() => {
                return Posts.removePost(postId)
            })
            .then(() => {
                return Account.removePost(postId);
            })
            .then(() => {
                res.json(true);
            })
            .catch(err => {
                return next(err);
            });
    });


    // COMMENT
    // AJOUTE
    router.post('/:id/comment/', (req, res, next) => {
        const postId = req.params.id;

        if(!req.body.comment) {
             return next('Aucun commentaire');
        }

        Access.createPostComment(req.user, postId)
            .then(() => {
                return Posts.addComment(req.user._id, postId, req.body.comment);
            })
            .then(post => {
                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });

    // SUPPRIME
    // router.delete('/:postId/comment/:commentId', (req, res, next) => {
    //     Posts.removeComment(req.params.postId, req.params.commentId)
    //         .then(comment => {
    //             res.json(comment);
    //         })
    //         .catch(err => {
    //             return next(err);
    //         });
    // });

    return router;
}