const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
} = graphql;

const UserModel = require('../../model/accounts');
const PostModel = require('../../model/post');

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => {
        const UserType = require('./user');
        const CommentType = require('./comment');

        return {
            id: { type: GraphQLID },
            fromUserId: { type: GraphQLID },
            fromUser: {
                type: UserType,
                resolve(post, args, context) {
                    return UserModel.getById(post.fromUserId);
                }
            },
            toUserId: { type: GraphQLID },
            toUser: {
                type: UserType,
                resolve(post, args, context) {
                    return UserModel.getById(post.toUserId);
                }
            },
            title: { type: GraphQLString },
            text: { type: GraphQLString },
            image: { type: GraphQLString },
            comments: { type: new GraphQLList(CommentType) },
            date: { type: GraphQLString },
        };
    }
});

module.exports = PostType;
