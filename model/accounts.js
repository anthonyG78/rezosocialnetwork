const conf          = require('../conf/conf')[process.env.NODE_ENV || 'production'];
const mongoose  	= require('mongoose');
const passportLM 	= require('passport-local-mongoose');
const bcrypt 		= require('bcryptjs');
const Schema 		= new mongoose.Schema(require('./schema/accounts'));
const userMinFields = conf.app.userMinFields;

class Account {
    // static serialize(user, done) {
    //     var sessionUser = {
    //         _id         : user._id,
    //         username    : user.username, 
    //         firstName   : user.firstName, 
    //         lastName    : user.lastName, 
    //         gender      : user.gender, 
    //         email       : user.email, 
    //         avatar      : user.avatar,
    //         background  : user.background,
    //         age         : user.age,
    //         preferences : user.preferences,
    //         date        : user.date,
    //         connected   : user.connected
    //     }
    //     done(null, sessionUser);
    // }

    // static deSerialize(sessionUser, done) {
    //     done(null, sessionUser);
    // }

    // USER
    static getById(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, (err, user) => {
                if(err) {
                    return reject('Impossible d\'acceder à ce membre'); 
                }

                if (!user) {
                    return reject('Ce membre n\'existe pas');
                }

                resolve(user);
            });
        });
    }

    static getByIds(usersIds) {
        return new Promise((resolve, reject) => {
            this.find({_id: {$in: usersIds}}, (err, users) => {
                if(err) {
                    return reject('Impossible d\'acceder à ces membres'); 
                }

                if (!users) {
                    return reject('Aucun membre trouvé');
                }

                resolve(users);
            });
        });
    }

    static userExists(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {_id: 1, state: 1}, (err, user) => {
                if(err) {
                    return reject('Impossible d\'acceder à ce membre');
                }

                if(!user) {
                    return reject('Ce membre n\'existe pas');
                }

                if(user.state == false) {
                    return reject('Ce membre n\'existe plus');
                }

                // resolve(user !== null ? true : false);
                resolve(user);
            });
        });
    }

    static searchUserByName(term, limit) {
        return new Promise((resolve, reject) => {
            var validChar = 'a-zA-A0-9_-';
            var pattern = new RegExp("^[" + validChar + "]{0,2}" + term + "[" + validChar + "]*", "i");

            this.find({ $and: [
                    { state: true },
                    { $or: [{username: {$regex: pattern}}, {firstName: {$regex: pattern}}, {lastName: {$regex: pattern}}] }
                ] })
                // .or([{username: {$regex: pattern}}, {firstName: {$regex: pattern}}, {lastName: {$regex: pattern}}])
                .limit(limit)
                .exec((err, users) => {
                    if(err){
                        return reject('Impossible d\'acceder à des membres');
                    }
                    resolve(users);
                });
       });
    }

    static setConnectionStatus(userId, status) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({_id: userId}, {$set: {connected: status ? true : false}}, {new: true}, (err, user) => {
                if (err) {
                    return reject('Impossible de gerer le satus de connection');
                }

                resolve(user);
            });
        });
    }

    static updateProfil(userId, profil) {
        return new Promise((resolve, reject) => {
            const filtered = {};
            Object.keys(profil).forEach(function(key) {
                if (profil[key] !== "") {
                    filtered[key] = profil[key];
                }
            });
            this.findOneAndUpdate(
                { _id: userId },
                { $set: filtered }, 
                { new: true }, 
                (err, user) => {
                    if (err) {
                        return reject('Impossible de modifier le profil');
                    }

                    resolve(user);
                });
        });
    }

    static deleteProfil(userId, profil) {
        return new Promise((resolve, reject) => {
            this.findByIdAndRemove(userId, (err, user) => {
                const friendsId = user.friends.map(friend => {
                    return friend._id;
                });
                
                this.update(
                    { _id: { $in: friendsId }},
                    { $pull: { 'friends': {_id: user._id }}},
                    { new: true, multi: true },
                    (err, docs) => {
                        if (err) {
                            return reject('Impossible de supprimer le profil');
                        }
                        resolve(user);
                    });
            });
        });
    }

    static desactiveProfil(userId) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(
                {_id: userId},
                { $set: {
                    state: false, 
                    email: null, 
                    connected: false, 
                    password: null, 
                    hash: null, 
                    salt: null,
                    friends: null,
                    posts: null,
                    discussions: null,
                    notifications: null,
                }},
                {new: true},
                (err, user) => {
                    if(err) {
                        return reject('Impossible de supprimer le profil');
                    }
                     resolve(user);
                });
        });
    }

    // FRIENDS
    static searchFriends(usersId, term, limit) {
        return new Promise((resolve, reject) => {
            var validChar = 'a-zA-A0-9_-';
            var pattern = new RegExp("^[" + validChar + "]{0,2}" + term + "[" + validChar + "]*", "i");

            this.find({ $and: [{_id: { $in: usersId }}, {state: true}] })
                .or([{username: {$regex: pattern}}, {firstName: {$regex: pattern}}, {lastName: {$regex: pattern}}])
                .limit(limit)
                .exec((err, users) => {
                    if(err){
                        return reject('Impossible de trouver des amis');
                    }
                    resolve(users);
                });
       });
    }

    static addFriend(userId, friendId, state) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({
                    _id: userId,
                    'friends._id': {$ne : friendId}
                }, 
                {$push: {"friends": {_id: friendId, accepted: state}}},
                {upsert: false},
                (err, user) => {
                    if(err){
                        return reject('Impossible d\'ajouter cet ami');
                    }

                    if(!user) {
                        return reject('Cet ami n\'a pas été ajouté');
                    }

                    resolve(user);
                });
        });
    }

    static removeFriend(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate(
                {_id: userId}, 
                {$pull: {"friends": {_id: friendId}}},
                {new: true},
                (err, user) => {
                    if(err){
                        return reject('Impossible de supprimer cet ami');
                    }

                    if(!user) {
                        return reject('Cet ami n\'a pas été supprimé');
                    }

                    resolve(user);
                });
        });
    }

    static hasFriendshipAlreadyRequested(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId, 'friends._id': friendId}, 
                {_id: 1},
                (err, user) => {
                    if(err){
                        return reject('Impossible de savoir si une amitié est en cours');
                    }
                    
                    resolve(user ? true : false);
                });
        });
    }

    static isFriend(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOne({ _id: userId, friends: { $elemMatch: { _id: friendId, accepted: 2 } } }, 
                {_id: 1, friends: 1 },
                (err, user) => {
                    if(err){
                        return reject('Impossible de savoir si ce membre est un ami');
                    }

                    resolve(user ? true : false);
                });
        });
    }

    static acceptFriend(userId, friendId) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate(
                { _id: userId, "friends._id": friendId },
                { $set: { "friends.$.accepted": 2 }},
                { new: true })
                .populate('friends._id')
                .exec((err, user) => {
                    if(err) {
                        return reject('Impossible d\'accepter ce membre en ami');
                    }

                    if(!user) {
                        return reject('Ce membre n\'a pas pu être accepté en ami');
                    }

                    resolve(user ? user.friends.map(friend => {
                        return friend._id;
                    }) : []);
                });
        });
    }

    static getFriendsList(userId, accepted, sort) {
        return new Promise((resolve, reject) => {
            // this.findOne({_id: userId}, {friends: 1, date: 1})
            //     .populate('friends._id')
            //     .exec((err, user) => {
            //         if(err){
            //             return reject(err);
            //         }
            //         resolve(user ? user.friends.map(friend => {
            //             // friend._id.accepted = friend.accepted;
            //             return friend._id;
            //         }) : []);
            //     });
            this.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(userId) } },
                { $unwind : "$friends" },
                { $sort : {"friends.accepted": sort || 1} },
                { $group: {"_id": "$_id", "friends": {"$push": "$friends"} } },
            ], (err, user) => {
                this.populate( user[0], {path: 'friends._id', match: {state: true}}, (err, user) => {
                    if(err){
                        return reject('Impossible de récupérer la liste d\'amis');
                    }
                    if(user) {
                        let result = [];
                        user.friends.forEach(friend => {
                            if(friend._id) {
                                result.push(friend._id);
                            }
                        })
                        resolve(result);
                    } else {
                        resolve([]);
                    }
                    // resolve(user ? user.friends.map(friend => {
                    //     return friend._id;
                    // }) : []);
                });
            });
        });
    }

    static getFriendsIds(userId, accepted) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {friends: 1, date: 1})
                .populate('friends._id')
                .exec((err, user) => {
                    if(err){
                        return reject('Impossible de récupérer la liste d\'amis');
                    }

                    resolve(user ? user.friends.map(friend => {
                        if(friend.accepted == 2) {
                            return friend._id._id;
                        }
                    }) : []);
                });
        });
    }

    // POSTS
    static getPosts(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {posts: 1})
                .populate('posts')
                .exec((err, user) => {
                    if(err){
                        return reject('Impossible de récupérer la liste des posts du profil');
                    }

                    if(user.posts.length <= 0) {
                        return reject('Aucun post trouvé dans le profil');
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
                        return reject('Impossible d\'ajouter ce post au profil');
                    }

                    if(!docs.ok) {
                        throw new Error('Ce post n\'a pas été ajouté au profil');
                    }

                    resolve(docs);
                });
        });
    }

    static removePost(postId) {
        return new Promise((resolve, reject) => {
            var mongooseTypesObjectId = mongoose.Types.ObjectId;

            this.update(
                {"posts": {$eq: mongooseTypesObjectId(postId)}}, 
                {$pull: {"posts": mongooseTypesObjectId(postId)}},
                {new: true, multi: true},
                (err, docs) => {
                    if(err){
                        return reject('Impossible de supprimer ce post au profil');
                    }

                    if(!docs.ok) {
                        throw new Error('Ce post n\'a pas été supprimé du profil');
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
                        return reject('Impossible de savoir si la discussion existe dans le profil');
                    }

                    resolve(user !== null && 'discussions' in user);
                });
        });
    }

    static getDiscussions(userId, sort) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {discussions: 1})
                .populate('discussions', null, null, { sort: { 'dateMaj': sort || -1 } })
                .exec((err, user) => {
                    if(err){
                        return reject('Impossible de récuperer les la liste des discussions du profil');
                    }
                    if(!user) {
                        return reject('Aucun discussion trouvée dans le profil');
                    }
                    resolve(user ? user.discussions : []);
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
                {_id: {$in: ids} }, 
                {$push: {"discussions": mongooseTypesObjectId(discussionId)}},
                {new: true, multi: true},
                (err, docs) => {
                    if(err){
                        return reject('Impossible d\'ajouter la discussion au profil');
                    }

                    if(docs.nModified < usersId.length){
                        throw new Error('Tous les participants n\'ont pas été ajouté');
                    }

                    if(!docs.ok) {
                        throw new Error('Aucun participants n\'a été ajouté');
                    }

                    resolve(docs);
                });
        });
    }

    static removeDiscussion(userId, discussionId) {
        return new Promise((resolve, reject) => {
            var updateFunc = 'findOneAndUpdate';
            var condition = {_id: userId};

            if(Array.isArray(userId)) {
                updateFunc = 'update';
                condition = { _id: { $in: userId } };
            }

            this[updateFunc](
                condition, 
                {$pull: {"discussions": discussionId}},
                {new: true, passRawResult: true},
                (err, user, raw) => {
                    if(err){
                        return reject('Impossible de supprimer la discussion du profil');
                    }

                    resolve(discussionId);
                });
        });
    }

    // NOTIFICATIONS
    static getNotificationsFor(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, {notifications: 1})
                .exec((err, user) => {
                    if(err){
                        return reject('Impossible de récupérer les notifications');
                    }

                    resolve(!user ? [] : user.notifications);
                });
        });
    }

    static deleteNotificationFor(userId, key, value) {
        return new Promise((resolve, reject) => {
            let update;

            if (!value) {
                update = { $set: {} };
                update.$set["notifications." + key] = [];
            } else {
                update = { $pull: {} };
                update.$pull["notifications." + key] = mongoose.Types.ObjectId(value);
                // console.log(userId, update);
            }

            this.findOneAndUpdate({_id: userId}, 
                update,
                {new: true},
                (err, user) => {
                    if(err){
                        return reject('Impossible de supprimer des notifications');
                    }

                    resolve(!user ? [] : user.notifications);
                });
        });
    }

    static deleteNotification(key, value) {
        return new Promise((resolve, reject) => {
            let update;

            if (!value) {
                update = { $set: {} };
                update.$set["notifications." + key] = [];
            } else {
                update = { $pull: {} };
                update.$pull["notifications." + key] = mongoose.Types.ObjectId(value);
            }

            this.update({}, 
                update,
                {new: true, multi: true},
                (err, user) => {
                    if(err){
                        return reject('Impossible de supprimer des notifications');
                    }

                    resolve(!user ? [] : user.notifications);
                });
        });
    }

    static deleteAllNotificationFrom(userId) {
        return new Promise((resolve, reject) => {
            this.findOne({_id: userId}, (err, user) => {
                if (err || !user) {
                   reject('Impossible de supprimer toutes les notifications'); 
                }

                const mongooseTypesObjectId = mongoose.Types.ObjectId;
                const friendsId = user.friends.map(friend => mongooseTypesObjectId(friend._id));
                const postsId = user.posts.map(post => mongooseTypesObjectId(post));
                const dicussionsId = user.discussions.map(discussion => mongooseTypesObjectId(discussion));
                const update = {
                    $pull: {},
                    $pullAll: {},
                };

                if (friendsId.length) {
                    // update.$pull.friends = userId;
                    update.$pull['notifications.friends'] = userId;

                    if (postsId.length) {
                        // update.$pullAll.posts = postsId;
                        update.$pullAll['notifications.posts'] = postsId;
                    }
                    if (dicussionsId.length) {
                        // update.$pullAll.dicussions = dicussionsId;
                        update.$pullAll['notifications.discussions'] = dicussionsId;
                    }
                    console.log(friendsId, update);
                } else {
                    // resolve(true);
                }
            });
        });
    }

    static addNotificationFor(userId, notificationKey, value) {
        return new Promise((resolve, reject) => {
            const update = {
                $push: {},
            };

            update.$push["notifications." + notificationKey] = value;

            var condition = { _id: userId };
            var updateFunc = 'findOneAndUpdate';

            if(Array.isArray(userId)) {
                condition = { _id: { $in: userId } };
                updateFunc = 'update';
            }

            this[updateFunc](
                condition, 
                update,
                {new: true, multi: true},
                (err, user) => {
                    if(err){
                        return reject('Impossible d\'ajouter des notifications');
                    }

                    resolve(!user ? [] : user.notifications);
                });
        });
    }
}

Schema.loadClass(Account);
Schema.plugin(passportLM, {
    usernameField: 'email',
});
// Schema.index({
//     username: 'text',
//     firstName: 'text',
//     lastName: 'text',
// });

// Schema.post('find', function(docs) {
//     docs.forEach((doc, i) => {
//         doc.id = doc._id ? doc._id : doc.id;
//         delete doc.password;
//     });
// });

module.exports = mongoose.model('accounts', Schema);