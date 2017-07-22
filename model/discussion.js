const conf          = require('../conf/conf')[process.env.NODE_ENV || 'dev'];
const mongoose      = require('mongoose');
const Schema        = new mongoose.Schema(require('./schema/discussion'));
const defaultDateSort = -1;
const userMinFields = conf.app.userMinFields;

class Discussion {
    // Discussion
    static getDiscussion(id) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: id})
                .populate('messages')
                .populate('messages.userId', userMinFields)
                .sort({date: defaultDateSort})
                .exec((err, discussion) => {
                    if(err) {
                        return reject(err);
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
                    return reject(err);
                }
                return resolve(discussion);
            });
        });
    }

    static updateDiscussion(id, discussion) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate({_id: id}, discussion, {new: true}, (err, discussion) => {
                if(err) {
                    return reject(err);
                }
                resolve(discussion);
            });
        });
    }

    static removeDiscussion(id) {
        return new Promise((resolve, reject) => {
            this.findByIdAndRemove({_id: id}, (err, discussion) => {
                if(err) {
                    return reject(err);
                }

                resolve(discussion);
            });
        });
    }

    static closeDiscussion(id) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({_id: id}, {state: false}, {new: true}, (err, discussion) => {
                if(err) {
                    return reject(err);
                }
                resolve(discussion);
            });
        });
    }

    // Messages
    static addMessage(userId, discussionId, message) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(
                {_id: discussionId}, 
                {$push: {"messages": {userId: userId, text: message}}},
                {new: true}, 
                (err, post) => {
                    if(err) {
                        return reject(err);
                    }
                    resolve(post);
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