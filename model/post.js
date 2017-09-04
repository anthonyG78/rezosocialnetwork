const conf          = require('../conf/conf')[process.env.NODE_ENV || 'production'];
const mongoose      = require('mongoose');
const Schema        = new mongoose.Schema(require('./schema/post'));
const userMinFields = conf.app.userMinFields;
const defaultDateSort = -1;

class Posts {
    // POST
    static getPost(id) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: id})
                // .populate('userId', userMinFields)
                // .populate('comments.userId', userMinFields)
                .sort({date: defaultDateSort})
                .exec((err, docs) => {
                    if(err){
                        return reject('Impossible de récuper le post');
                    }

                    if (!docs) {
                        reject('Ce post n\'existe pas');
                    }

                    resolve(docs);
                });
        });
    }

    static addPost(data) {
        return new Promise((resolve, reject) => {
            try{
                var post = new this(data);
            }catch(err){
                return reject(err);
            }

            post.save((err, data) => {
                if (err){
                    return reject('Impossible d\'ajouter le post');
                }

                return resolve(data);
            });
        });
    }

    static updatePost(id, post) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate({_id: id}, post, {new: true, runValidators: true}, (err, post) => {
                if(err){
                    // return reject((Object.keys(err.errors).map(key => err.errors[key].message)).join(', '));
                    return reject('Impossible de modifier le post');
                }
                resolve(post);
            });
        });
    }

    static removePost(id) {
        return new Promise((resolve, reject) => {
            this.findByIdAndRemove({_id: id}, (err, post) => {
                if(err){
                    return reject('Impossible de supprimer le post');
                }

                resolve(post);
            });
        });
    }

    static removePostByUserId(userId) {
        return new Promise((resolve, reject) => {
            this.remove(
                { $or: [ {fromUserId: userId}, {toUserId: userId} ] }, 
                (err, post) => {
                    if(err){
                        return reject('Impossible de supprimer le post');
                    }
                    // console.log('removePostByUserId', post);
                    resolve(post);
                });
        });
    }

    // FOR PRIVILEGES
    static isAboutUsers(postId, usersId) {
        return new Promise((resolve, reject) => {
            this.findOne(
                { _id: postId, $or: [{fromUserId: { $in: usersId }}, {toUserId: { $in: usersId }}] },
                { _id: 1})
                .exec((err, post) => {
                    if(err){
                        return reject('Impossible de récuper le post');
                    }

                    resolve(post ? true : false);
                });
        });
    } 

    static isFromUserId(userId, postId) {
        return new Promise((resolve, reject) => {
            this.findOne(
                { _id: postId, fromUserId: userId },
                { _id: 1 })
                .exec((err, post) => {
                    if(err){
                        return reject('Impossible de récuper le post');
                    }

                    resolve(post ? true : false);
                });
        });
    } 

    // COMMENT
    static addComment(userId, postId, comment) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(
                {_id: postId}, 
                {$push: {"comments": {userId: userId, text: comment}}},
                {new: true}, 
                (err, post) => {
                    if(err){
                        return reject('Impossible d\'ajouter un commentaire');
                    }
                    resolve(post);
                });
        });
    }

    static removeComment(postId, commentId) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({_id: postId}, 
                {$pull: {"comments": {_id: commentId}}},
                (err, comment) => {
                    if(err){
                        return reject('Impossible de supprimer le commentaire');
                    }
                    resolve(comment);
                });
        });
    }

    // WALL
    static getUserWall(userId) {
        return new Promise((resolve, reject) => {
            this.find({toUserId: userId})
                .sort({date: defaultDateSort})
                .exec((err, posts) => {
                    if(err){
                        return reject('Impossible de récuperer les posts');
                    }

                    resolve(posts);
                });
        });
    }

    static getCommunityWall(friendsId) {
        return new Promise((resolve, reject) => {
            this.find({toUserId: {$in: friendsId}})
                .sort({date: defaultDateSort})
                .exec((err, posts) => {
                    if(err){
                        return reject('Impossible de récuperer les posts');
                    }
                    resolve(posts);
                });
        });
    }
}

Schema.loadClass(Posts);

module.exports = mongoose.model('posts', Schema);