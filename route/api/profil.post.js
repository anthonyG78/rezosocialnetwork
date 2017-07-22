const router    = require('express').Router();
const Posts     = require('../../model/post');
const Account     = require('../../model/accounts');

module.exports  = function(app){
    // POST
    // router.get('/', (req, res, next) => {
    //     Posts.getPostsByUserId(req.user._id)
    //         .then(posts => {
    //             res.json(posts);
    //         })
    //         .catch(err => {
    //             return next(err);
    //         })
    // });
    router.get('/', (req, res, next) => {
        Account.getPosts(req.user._id)
            .then(posts => {
                res.json(posts);
            })
            .catch(err => {
                return next(err);
            })
    });

    // router.post('/', (req, res, next) => {
    //     Posts.addPost(req.body, req.user._id)
    //         .then(post => {
    //             res.json(post);
    //         })
    //         .catch(err => {
    //             return next(err);
    //         });
    // });
    router.post('/', (req, res, next) => {
        var post = req.body;

        if(!post.toUserId) {
            return next('Destinataire non renseigné');
        }

        post.fromUserId = req.user._id;

        Posts.addPost(post)
            .then(_post => {
                post = _post;
                Account.addPost([post.fromUserId, post.toUserId], post._id);
            })
            .then(modified => {
                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.get('/:id', (req, res, next) => {
        Posts.getPost(req.params.id)
            .then(post => {
                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.put('/:id', (req, res, next) => {
        Posts.updatePost(req.params.id, req.body)
            .then(post => {
                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.delete('/:id', (req, res, next) => {
        Posts.removePost(req.params.id)
            .then(post => {
                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });


    // COMMENT
    router.post('/:id/comment/', (req, res, next) => {
        if(!req.body.comment) {
             return next('Aucun commentaire');
        }

        Posts.addComment(req.user._id, req.params.id, req.body.comment)
            .then(post => {
                res.json(post);
            })
            .catch(err => {
                return next(err);
            });
    });

    router.delete('/:postId/comment/:commentId', (req, res, next) => {
        Posts.removeComment(req.params.postId, req.params.commentId)
            .then(comment => {
                res.json(comment);
            })
            .catch(err => {
                return next(err);
            });
    });

    return router;
}