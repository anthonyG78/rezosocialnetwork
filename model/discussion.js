const conf          = require('../conf/conf')[process.env.NODE_ENV || 'production'];
const mongoose      = require('mongoose');
const Schema        = new mongoose.Schema(require('./schema/discussion'));
const defaultDateSort = -1;
const userMinFields = conf.app.userMinFields;

class Discussion {
    // Discussion
    static getDiscussion(id, sort) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: id})
                .populate('messages')
                // .sort({dateMaj: sort || -1})
                .exec((err, discussion) => {
                    if(err) {
                        return reject('Impossible d\'acceder à la discussion');
                    }
                    if (!discussion) {
                        return reject('La discussion n\'existe pas');
                    }
                    resolve(discussion);
                });
        });
    }

    static getDiscussionsWith(usersId, sort) {
        return new Promise((resolve, reject) => {
            var mongooseTypesObjectId = mongoose.Types.ObjectId;
            var ids = usersId.map((id) => {
                return mongooseTypesObjectId(id);
            });
            
            this.find({usersId: {$all: ids}})
                .sort({ 'dateMaj': sort || -1 })
                .exec((err, discussion) => {
                    if(err){
                        return reject('Impossible d\'acceder à la discussion');
                    }
                    if (!discussion) {
                        return reject('Aucune discussion');
                    }
                    resolve(discussion);
                });
        });
    }

    static addDiscussion(data) {
        return new Promise((resolve, reject) => {
            try{
                var discussion = new this(data);
            }catch(err){
                return reject(err);
            }

            discussion.markModified('ownerId');
            discussion.markModified('messages');
            discussion.save((err) => {
                if (err) {
                    return reject('Impossible d\'ajouter la discussion');
                }
                return resolve(discussion);
            });
        });
    }

    static updateDiscussion(id, discussion) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate({_id: id}, discussion, {new: true}, (err, discussion) => {
                if(err) {
                    return reject('Impossible de modifier la discussion');
                }
                resolve(discussion);
            });
        });
    }

    static removeDiscussion(id) {
        return new Promise((resolve, reject) => {
            this.findByIdAndRemove({_id: id}, (err, discussion) => {
                if(err) {
                    return reject('Impossible de supprimer la discussion');
                }

                resolve(discussion);
            });
        });
    }

    static pullUserFromDiscussion(userId) {
        return new Promise((resolve, reject) => {
            this.update(
                {},
                { $pull: {usersId: userId} },
                { mutli: true },
                (err,  doc) => {
                    if(err){
                        return reject(err);
                    }
                    // console.log(doc);
                    if (doc.nModified) {
                        this.remove(
                            { $where: 'this.usersId.length <= 1' },
                            (err,  doc) => {
                                if(err){
                                    return reject(err);
                                }
                                resolve(doc);
                            });
                    } else {
                        resolve(doc);
                    }
                });
        });
    }

    static closeDiscussion(id) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({_id: id}, {state: false}, {new: true}, (err, discussion) => {
                if(err) {
                    return reject('Impossible de fermer la discussion');
                }
                resolve(discussion);
            });
        });
    }

    // FOR PRIVILEGES
    static isWithUserId(userId, discussionId) {
        return new Promise((resolve, reject) => {
            this.findOne({ $and: [ {_id: discussionId}, {usersId: userId} ] })
                .exec((err, discussion) => {
                    if(err) {
                        return reject('Impossible d\'acceder à la discussion');
                    }
                    
                    resolve(discussion ? true : false);
                });
        });
    }

    // Messages
    static addMessage(userId, discussionId, message) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(
                {_id: discussionId}, 
                {$push: {messages: {userId: userId, text: message}}, $set: {dateMaj: Date.now()}},
                {new: true}, 
                (err, discussion) => {
                    if(err) {
                        return reject('Impossible d\'ajouter un message à la discussion');
                    }
                    resolve(discussion);
                });
        });
    }

    // static removeMessage(discussionId, messageId) {
    //     return new Promise((resolve, reject) => {
    //         this.findOneAndUpdate({_id: discussionId}, 
    //             {$pull: {"messages": {_id: messageId}}},
    //             (err, comment) => {
    //                 if(err) {
    //                     return reject(err);
    //                 }
    //                 resolve(comment);
    //             });
    //     });
    // }
}

Schema.loadClass(Discussion);

module.exports = mongoose.model('discussion', Schema);