const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} = graphql;

const UserModel = require('../../model/accounts');

const MessageType = new GraphQLObjectType({
    name: 'Message',
    fields: () => ({
        userId: { type: GraphQLID },
        user: {
            type: require('./user'),
            resolve(message, args, context) {
                return UserModel.getById(message.userId);
            }
        },
        text: { type: GraphQLString },
        date: { type: GraphQLString },
    })
});

module.exports = MessageType;
