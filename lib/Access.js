const UserModel = require('../model/accounts');
const PostModel = require('../model/post');
const DiscussionModel = require('../model/discussion');

class Access {
    static hasPrivilege(userLevel) {
        return userLevel < 2;
    }

    // GET
    static getUser(user, targetUserId) {
        return new Promise((resolve, reject) => {
            if (this.hasPrivilege(user.level) || user._id == targetUserId) {
                resolve();
            } else {
                return UserModel.isFriend(user._id, targetUserId)
                    .then(isFriend => {
                        if (isFriend) {
                            resolve();
                        } else {
                            return reject('Action interdite');
                        }
                    });
            }
        });
    }
    static getPost(user, postId) {
        return new Promise((resolve, reject) => {
            if (this.hasPrivilege(user.level)) {
                resolve();
            } else {
                const friendsId = user.friends.map(friend => friend.accepted == 2 ? friend._id : undefined);
                friendsId.push(user._id);

                return PostModel.isAboutUsers(postId, friendsId)
                    .then((isAbout) => {
                        if (isAbout) {
                            resolve();
                        } else {
                            return reject('Action interdite');
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }
    static getDiscussion(user, discussionId) {
        return new Promise((resolve, reject) => {
            if (this.hasPrivilege(user.level)) {
                resolve();
            } else {
                return DiscussionModel.isWithUserId(user._id, discussionId)
                    .then((isWith) => {
                        if (isWith) {
                            resolve();
                        } else {
                            reject('Action interdite');
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }

    // UPDATE
    static updateUser(user, targetUserId) {
        return new Promise((resolve, reject) => {
            if (this.hasPrivilege(user.level) || user._id == targetUserId) {
                resolve();
            } else {
                return reject('Action interdite');
            }
        });
    }
    static updatePost(user, postId) {
        return new Promise((resolve, reject) => {
            if (this.hasPrivilege(user.level)) {
                resolve();
            } else {
                return PostModel.isFromUserId(user.id, postId)
                    .then((isFrom) => {
                        if (isFrom) {
                            resolve();
                        } else {
                            reject('Action interdite');
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }
    static updateDiscussion(user, discussionId) {
        return this.getDiscussion(user, discussionId);
    }

    // CREATE
    static createUser(user, targetUserId) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
    static createPost(user, targetUserId) {
        return this.getUser(user, targetUserId);
    }
    static createDiscussion(user, usersId) {
        return new Promise((resolve, reject) => {
            return UserModel.getFriendsIds(user._id)
                .then((friendsId) => {
                    friendsId = friendsId.map(id => id.toString());
                    usersId.forEach(id => {
                        if(friendsId.indexOf(id) == -1) {
                            reject('Un participant n\'est pas un ami');
                        }
                        resolve();
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    // DELETE
    static deleteUser(user, targetUserId) {
        return this.updateUser(user, targetUserId);
    }
    static deletePost(user, postId) {
        return new Promise((resolve, reject) => {
            if (this.hasPrivilege(user.level)) {
                resolve();
            } else {
                return PostModel.isAboutUsers(postId, [user._id])
                    .then((isAbout) => {
                        if (isAbout) {
                            resolve();
                        } else {
                            return reject('Action interdite');
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            }
        });
    }
    static deleteDiscussion(user, discussionId) {
        return this.getDiscussion(user, discussionId);
    }
}

module.exports = Access;