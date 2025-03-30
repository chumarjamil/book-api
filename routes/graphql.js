// routes/graphql.js
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('../graphql/schema');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');

const router = express.Router();

router.use('/', auth, authorize(['admin']), graphqlHTTP({
  schema,
  graphiql: process.env.NODE_ENV === 'development', // Enable GraphiQL in development
}));

module.exports = router;