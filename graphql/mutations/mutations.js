const graphql = require('graphql');
const { GraphQLObjectType } = graphql;

module.exports = new GraphQLObjectType({
    name: 'Mutation',
    fields: {},
});
