const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList
} = graphql;

const UserModel = require('../../model/accounts');
const PostModel = require('../../model/post');
const DiscussionModel = require('../../model/discussion');
const Access = require('../../lib/Access');

module.exports = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => {
        const UserType = require('../types/user');
        const PostType = require('../types/post');
        const DiscussionType = require('../types/discussion');
        
        return {
            // User
            getUser: {
                type: UserType,
                args: {
                    id: { type: GraphQLID }
                },
                resolve(parentValue, args, context) {
                    const selfUser = context.user;
                    const selfId = selfUser._id.toString();
                    const id = args.id || selfId;

                    context.targetUserId = selfId;

                    return UserModel.getById(id)
                        .then((user) => {
                            if(user.state == false) {
                                return {
                                    _id: user._id,
                                    id: user.id,
                                    id: user.id,
                                    username: user.username,
                                    state: user.state,
                                };
                            }
                            // Hide email if user not friend or self not Admin
                            if (args.id !== selfId) {
                                let isFriend = false;
                                
                                selfUser.friends.forEach(friend => {
                                    if(friend._id == id) {
                                        isFriend = true;
                                    }
                                });

                                if (!isFriend) {
                                    user.email = undefined;
                                }
                            }

                            return user;
                        })
                        .catch(err => {
                            throw new Error(err);
                        });
                }
            },
            searchUsers: {
                type: new GraphQLList(UserType),
                args: {
                    term: { type: GraphQLString },
                    limit: { type: GraphQLInt },
                },
                resolve(parentValue, args, context) {
                    const selfUser = context.user;
                    const id = args.id || selfUser._id.toString();
                    context.targetUserId = selfUser._id.toString();

                    return UserModel.searchUserByName(args.term, parseInt(args.limit))
                        .catch(err => {
                            throw new Error(err);
                        });
                }
            },
            searchFriends: {
                type: new GraphQLList(UserType),
                args: {
                    id: { type: GraphQLID },
                    term: { type: GraphQLString },
                    limit: { type: GraphQLInt },
                },
                resolve(parentValue, args, context) {
                    const selfUser = context.user;
                    const id = args.id || selfUser._id.toString();
                    const friendsId = context.user.friends.map((friend) => {
                        return friend._id;
                    });
                    context.targetUserId = selfUser._id.toString();

                    return UserModel.searchFriends(friendsId, args.term, parseInt(args.limit))
                        .catch(err => {
                            throw new Error(err);
                        });
                }
            },
            // Posts
            getCommunityPosts: {
                type: new GraphQLList(PostType),
                args: {
                    id: { type: GraphQLID }
                },
                resolve(parentValue, args, context) {
                    const selfUser = context.user;
                    const userId = args.id || selfUser._id;

                    return UserModel.getFriendsIds(userId, 2)
                        .then((friendsList) => {
                            friendsList.push(userId);
                            return PostModel.getCommunityWall(friendsList);
                        })
                        .catch(err => {
                            throw new Error(err);
                        });
                }
            },
            getPosts: {
                type: new GraphQLList(PostType),
                args: {
                    id: { type: GraphQLID }
                },
                resolve(parentValue, args, context) {
                    const userId = args.id || selfUser._id;
                    const selfUser = context.user;

                    return Access.getUser(selfUser, userId)
                        .then((pass) => {
                            return PostModel.getUserWall(userId);
                        })
                        .catch(err => {
                            throw new Error(err);
                        });
                }
            },
            getPost: {
                type: PostType,
                args: {
                    id: { type: GraphQLID }
                },
                resolve(parentValue, args, context) {
                    const selfUser = context.user;

                    return Access.getPost(selfUser, args.id)
                        .then((pass) => {
                            return PostModel.getPost(args.id);
                        })
                        .catch(err => {
                            throw new Error(err);
                        });
                }
            },
            // Friends
            getFriends: {
                type: new GraphQLList(UserType),
                args: {
                    id: { type: GraphQLID }
                },
                resolve(parentValue, args, context) {
                    const userId = args.id || selfUser._id;
                    const selfUser = context.user;

                    return Access.getUser(selfUser, userId)
                        .then((pass) => {
                            context.targetUserId = userId;
                            return UserModel.getFriendsList(userId, true);
                        });
                }
            },
            // Discussion
            getDiscussions: {
                type: new GraphQLList(DiscussionType),
                args: {
                    id: { type: GraphQLID }
                },
                resolve(parentValue, args, context) {
                    const selfUser = context.user;
                    const selfUserId = selfUser._id.toString();
                    const userId = args.id || selfUserId;

                    return Access.getUser(selfUser, userId)
                        .then((pass) => {
                            if (userId !== selfUserId) {
                                return DiscussionModel.getDiscussionsWith([userId, selfUserId])
                                    .catch(err => {
                                        throw new Error(err);
                                    });
                            } else {
                                return UserModel.getDiscussions(userId)
                                    .catch(err => {
                                        throw new Error(err);
                                    });
                            }
                        });
                }
            },
            getDiscussion: {
                type: DiscussionType,
                args: {
                    id: { type: GraphQLID }
                },
                resolve(parentValue, args, context) {
                    const selfUser = context.user;

                    return Access.getDiscussion(selfUser, args.id)
                        .then((pass) => {
                            return DiscussionModel.getDiscussion(args.id)
                                .catch(err => {
                                    throw new Error(err);
                                });
                        });
                }
            },
        };
    },
});