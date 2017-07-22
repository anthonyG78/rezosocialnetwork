const conf          = require('../conf/conf')[process.env.NODE_ENV || 'dev'];
const mongoose      = require('mongoose');
const Schema        = new mongoose.Schema(require('./schema/post'));
const userMinFields = conf.app.userMinFields;
const defaultDateSort = -1;

class Posts {
    static getPost(id) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: id})
                .populate('userId', userMinFields)
                .populate('comments.userId', userMinFields)
                .sort({date: defaultDateSort})
                .exec((err, docs) => {
                    if(err){
                        return reject(err);
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

            post.save((err) => {
                if (err){
                    return reject(err);
                }
                return resolve(post);
            });
        });
    }

    static updatePost(id, post) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate({_id: id}, post, {new: true}, (err, post) => {
                if(err){
                    return reject(err);
                }
                resolve(post);
            });
        });
    }

    static removePost(id) {
        return new Promise((resolve, reject) => {
            this.findByIdAndRemove({_id: id}, (err, post) => {
                if(err){
                    return reject(err);
                }

                resolve(post);
            });
        });
    }

    static addComment(userId, postId, comment) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(
                {_id: postId}, 
                {$push: {"comments": {userId: userId, text: comment}}},
                {new: true}, 
                (err, post) => {
                    if(err){
                        return reject(err);
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
                        return reject(err);
                    }
                    resolve(comment);
                });
        });
    }

    static getPostsByUserId(userId) {
        return new Promise((resolve, reject) => {
            this.find({userId: userId})
                .populate('userId', userMinFields)
                .populate('comments.userId', userMinFields)
                .sort({date: defaultDateSort})
                // .limit(10)
                .exec((err, docs) => {
                    if(err){
                        return reject(err);
                    }

                    resolve(docs);
                });
        });
    };

    static getPostsByUsersIds(userIds) {
        return new Promise((resolve, reject) => {
            this.find({'userId': { $in: userIds }})
                .populate('userId', userMinFields)
                .populate('comments.userId', userMinFields)
                .sort({date: defaultDateSort})
                // .limit(10)
                .exec((err, docs) => {
                    if(err){
                        return reject(err);
                    }

                    resolve(docs);
                });
        });
    };
}

// class Posts {
//     static getPost(id) {
//         return new Promise((resolve, reject) => {
//             this.findOne({_id: id})
//                 .populate('userId', userMinFields)
//                 .populate('comments.userId', userMinFields)
//                 .sort({date: defaultDateSort})
//                 .exec((err, docs) => {
//                     if(err){
//                         return reject(err);
//                     }

//                     resolve(docs);
//                 });
//         });
//     }

//     static addPost(data, userId) {
//         return new Promise((resolve, reject) => {
//             data.userId = userId;

//             try{
//                 var post = new this(data);
//             }catch(err){
//                 return reject(err);
//             }

//             post.save((err) => {
//                 if (err){
//                     return reject(err);
//                 }
//                 return resolve(post);
//             });
//         });
//     }

//     static updatePost(id, post) {
//         return new Promise((resolve, reject) => {
//             this.findByIdAndUpdate({_id: id}, post, {new: true}, (err, post) => {
//                 if(err){
//                     return reject(err);
//                 }
//                 resolve(post);
//             });
//         });
//     }

//     static removePost(id) {
//         return new Promise((resolve, reject) => {
//             this.findByIdAndRemove({_id: id}, (err, post) => {
//                 if(err){
//                     return reject(err);
//                 }

//                 resolve(post);
//             });
//         });
//     }

//     static addComment(userId, postId, comment) {
//         return new Promise((resolve, reject) => {
//             this.findByIdAndUpdate(
//                 {_id: postId}, 
//                 {$push: {"comments": {userId: userId, text: comment}}},
//                 {new: true}, 
//                 (err, post) => {
//                     if(err){
//                         return reject(err);
//                     }
//                     resolve(post);
//                 });
//         });
//     }

//     static removeComment(postId, commentId) {
//         return new Promise((resolve, reject) => {
//             this.findOneAndUpdate({_id: postId}, 
//                 {$pull: {"comments": {_id: commentId}}},
//                 (err, comment) => {
//                     if(err){
//                         return reject(err);
//                     }
//                     resolve(comment);
//                 });
//         });
//     }

//     static getPostsByUserId(userId) {
//         return new Promise((resolve, reject) => {
//             this.find({userId: userId})
//                 .populate('userId', userMinFields)
//                 .populate('comments.userId', userMinFields)
//                 .sort({date: defaultDateSort})
//                 // .limit(10)
//                 .exec((err, docs) => {
//                     if(err){
//                         return reject(err);
//                     }

//                     resolve(docs);
//                 });
//         });
//     };

//     static getPostsByUsersIds(userIds) {
//         return new Promise((resolve, reject) => {
//             this.find({'userId': { $in: userIds }})
//                 .populate('userId', userMinFields)
//                 .populate('comments.userId', userMinFields)
//                 .sort({date: defaultDateSort})
//                 // .limit(10)
//                 .exec((err, docs) => {
//                     if(err){
//                         return reject(err);
//                     }

//                     resolve(docs);
//                 });
//         });
//     };
// }

Schema.loadClass(Posts);

module.exports = mongoose.model('posts', Schema);