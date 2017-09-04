const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLID,
} = graphql;

const NotificationType = new GraphQLObjectType({
    name: 'Notification',
    fields: () => ({
        posts: { type: new GraphQLList(GraphQLID) },
        friends: { type: new GraphQLList(GraphQLID) },
        discussions: { type: new GraphQLList(GraphQLID) },
    })
});

module.exports = NotificationType;
