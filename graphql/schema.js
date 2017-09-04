const graphql = require('graphql');
const { GraphQLSchema } = graphql;

const rootQueryType = require('./queries/rootQueryType');
const mutations = require('./mutations/mutations');

module.exports = new GraphQLSchema({
    query: rootQueryType,
    // mutation: mutations,
});