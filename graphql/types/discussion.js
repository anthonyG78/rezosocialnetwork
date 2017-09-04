const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLInt,
} = graphql;

const UserModel = require('../../model/accounts');

const DiscussionType = new GraphQLObjectType({
    name: 'Discussion',
    fields: () => ({
        id: { type: GraphQLID },
        state: { type: GraphQLBoolean },
        // ownerId: { type: GraphQLID },
        // owner: {
        //     type: require('./user'),
        //     resolve(discussion, args, context) {
        //         return UserModel.getById(discussion.ownerId);
        //     }
        // },
        usersId: { type: new GraphQLList(GraphQLID) },
        users: {
            type: new GraphQLList(require('./user')),
            resolve(discussion, args, context) {
                return UserModel.getByIds(discussion.usersId);
            },
        },
        subject: { type: GraphQLString },
        messages: { type: new GraphQLList(require('./message')) },
        date: { type: GraphQLString },
        dateMaj: { type: GraphQLString },
    })
});

module.exports = DiscussionType;
