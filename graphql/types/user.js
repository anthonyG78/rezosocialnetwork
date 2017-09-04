const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
} = graphql;

const UserModel = require('../../model/accounts');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        gender: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        avatar: { type: GraphQLString },
        background: { type: GraphQLString },
        description: { type: GraphQLString },
        age: { type: GraphQLString },
        preferences: { type: new GraphQLList(GraphQLString) },
        friends: {
            type: new GraphQLList(UserType),
            resolve(user, args, context) {
                return UserModel.getFriendsList(user.id, true);
            }
        },
        posts: {
            type: new GraphQLList(require('./post')),
            resolve(user, args, context) {
                return UserModel.getPosts(user.id);
            }
        },
        discussions: {
            type: new GraphQLList(require('./discussion')),
            resolve(user, args, context) {
                return UserModel.getDiscussions(user.id);
            }
        },
        level: { type: GraphQLInt },
        date: { type: GraphQLString },
        connected: { type: GraphQLBoolean },
        accepted:  { 
            type: GraphQLInt,
            resolve(user, args, context) {
                let accepted = -1;
                // const targetUserId = context.targetUserId;
                // const friends = user.friends;

                // friends.forEach(friend => {
                //     if (targetUserId == friend._id.toString()) {
                //         accepted = friend.accepted;
                //     }
                // });

                const targetUserId = user._id;
                const friends = context.user.friends;

                friends.forEach(friend => {
                    if (targetUserId == friend._id.toString()) {
                        accepted = friend.accepted;
                    }
                });

                return accepted;
            }
        },
        notifications: { type: require('./notification') },
    })
});

module.exports = UserType;
