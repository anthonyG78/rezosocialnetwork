const conf          = require('../conf/conf')[process.env.NODE_ENV || 'dev'];
const mongoose  	= require('mongoose');
const passportLM 	= require('passport-local-mongoose');
const bcrypt 		= require('bcryptjs');
const Schema 		= new mongoose.Schema(require('./schema/accounts'));
const userMinFields = conf.app.userMinFields;


class Account {
    static serialize(user, done) {
        var sessionUser = {
            _id         : user._id,
            username    : user.username, 
            firstName   : user.firstName, 
            lastName    : user.lastName, 
            gender      : user.gender, 
            email       : user.email, 
            avatar      : user.avatar,
            background  : user.background,
            age         : user.age,
            preferences : user.preferences,
            date        : user.date,
            connected   : user.connected
        }
        done(null, sessionUser);
    }

    static deSerialize(sessionUser, done) {
        done(null, sessionUser);
    }

    static userExists(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {_id: 1}, (err, user) => {
                if(err) {
                    return reject(err); 
                }

                resolve(user !== null ? true : false);
            });
        });
    }

    static searchUserByName(term) {
        return new Promise((resolve, reject) => {
            var validChar = 'a-zA-A0-9_-';
            var pattern = new RegExp("[" + validChar + "]{0,3}" + term + "[" + validChar + "]*", "i");

            this.find()
                .or([{username: {$regex: pattern}}, {firstName: {$regex: pattern}}, {lastName: {$regex: pattern}}])
                .limit(10)
                .exec((err, user) => {
                    if(err){
                        return reject(err);
                    }
                    resolve(user);
                });
       });
    }

    static setConnectionStatus(userId, status) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({_id: userId}, {$set: {connected: status ? true : false}}, (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(true);
            });
        });
    }

    // FRIENDS
    static addFriend(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({
                    _id: userId,
                    'friends.userId': {$ne : friendId}
                }, 
                {$push: {"friends": {userId: friendId}}},
                {upsert: false},
                (err, user) => {
                    if(err){
                        return reject(err);
                    }

                    resolve(user);
                });
        });
    }

    static removeFriend(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({_id: userId}, 
                {$pull: {"friends": {userId: friendId}}},
                (err, user) => {
                    if(err){
                        return reject(err);
                    }

                    if(!user) {
                        return reject("Impossible de supprimer cet ami");
                    }

                    resolve(user);
                });
        });
    }

    static hasFriendshipAlreadyRequested(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId, 'friends.userId': friendId}, 
                {_id: 1},
                (err, user) => {
                    if(err){
                        return reject(err);
                    }
                    
                    resolve(user ? true : false);
                });
        });
    }

    static acceptFriend(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate(
                { "_id": userId, "friends.userId": friendId },
                { "$set": { "friends.$.accepted": true }},
                { new: true }, 
                function(err, user) {
                    if(err) {
                        return reject(err);
                    }

                    if(!user) {
                        return reject("Impossible d'accepter cette personne en ami");
                    }

                    user.friends.forEach((friend) => {
                        if(friend.userId == friendId && friend.accepted === true) {
                            return reject("Cette personne est déjà votre ami");
                        }
                    });

                    resolve(user);
                });
        });
    }

    static getFriendsList(userId, accepted) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId, 'friends.accepted': accepted == true}, {friends: 1, 'friends.$': 1})
                .populate('friends.userId', userMinFields)
                .exec((err, user) => {
                    if(err){
                        return reject(err);
                    }
                    resolve(user);
                });
        });
    }

    // POSTS
    static getPosts(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {posts: 1})
                .populate({
                    path: 'posts',
                    populate: { 
                        path: 'toUserId fromUserId',
                        select: '_id username friends discussion',
                        populate: {
                            path: 'friends.userId',
                            select: '_id username friends',
                        }
                    }
                })
                .exec((err, user) => {
                    if(err){
                        return reject(err);
                    }

                    if(user.posts.length <= 0) {
                        return reject('Aucun post trouvé');
                    }

                    resolve(user.posts);
                });
        });
    }

    static addPost(usersId, postId) {
        return new Promise((resolve, reject) => {
            var mongooseTypesObjectId = mongoose.Types.ObjectId;
            var ids = usersId.map((id) => {
                return mongooseTypesObjectId(id);
            });

            this.update(
                {_id: {$in: ids}, "posts": {$ne: mongooseTypesObjectId(postId)}}, 
                {$push: {"posts": mongooseTypesObjectId(postId)}},
                {new: true, multi: true},
                (err, docs) => {
                    if(err){
                        return reject(err);
                    }

                    if(!docs.ok) {
                        throw new Error('Impossible de référencer le post');
                    }

                    resolve(docs);
                });
        });
    }

    // DISCUSSIONS
    static hasDiscussion(userId, discussionId) {
        return new Promise((resolve, reject) => {
            this.findOne(
                {_id: userId, "discussions": discussionId},
                {discussions: 1},
                (err, user) => {
                    if(err){
                        return reject(err);
                    }

                    resolve(user !== null && 'discussions' in user);
                });
        });
    }
    static getDiscussions(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {discussions: 1})
                .populate('discussions')
                .exec((err, user) => {
                    if(err){
                        return reject(err);
                    }

                    if(user.discussions.length <= 0) {
                        return reject('Aucune discussion trouvée');
                    }

                    resolve(user.discussions);
                });
        });
    }

    static addDiscussion(usersId, discussionId) {
        return new Promise((resolve, reject) => {
            var mongooseTypesObjectId = mongoose.Types.ObjectId;
            var ids = usersId.map((id) => {
                return mongooseTypesObjectId(id);
            });

            this.update(
                {_id: {$in: ids}, "discussions": {$ne: mongooseTypesObjectId(discussionId)}}, 
                {$push: {"discussions": mongooseTypesObjectId(discussionId)}},
                {new: true, multi: true},
                (err, docs) => {
                    if(err){
                        return reject(err);
                    }

                    if(docs.nModified < usersId.length){
                        throw new Error('Tous les participants n\'ont pas été ajoutés');
                    }

                    if(!docs.ok) {
                        throw new Error('Les participants n\'ont pas été ajoutés');
                    }

                    resolve(docs);
                });
        });
    }

    static removeDiscussion(userId, discussionId) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({_id: userId}, 
                {$pull: {"discussions": discussionId}},
                {new: true, passRawResult: true},
                (err, user, raw) => {
                    if(err){
                        return reject(err);
                    }

                    user.discussions.forEach(discussion => {
                        if(discussion._id == discussionId) {
                            throw new Error("La dicussion n'a pas été supprimée");
                        }
                    });

                    resolve(discussionId);
                });
        });
    }
}

Schema.loadClass(Account);
Schema.plugin(passportLM, {
    // usernameField : 'email',
});
// Schema.index({
//     username: 'text',
//     firstName: 'text',
//     lastName: 'text',
// });

module.exports = mongoose.model('accounts', Schema);