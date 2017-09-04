const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} = graphql;

const UserModel = require('../../model/accounts');

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({
        userId: { type: GraphQLID },
        user: {
            type: require('./user'),
            resolve(comment, args, context) {
                return UserModel.getById(comment.userId);
            }
        },
        text: { type: GraphQLString },
        date: { type: GraphQLString },
    })
});

module.exports = CommentType;
