const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql');
const pool = require('../db');

const BookType = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    author: { type: GraphQLString },
    cover_image: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLInt } },
      resolve: async (parent, args) => {
        const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [args.id]);
        return rows[0];
      },
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: async () => {
        const { rows } = await pool.query('SELECT * FROM books');
        return rows;
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    createBook: {
      type: BookType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: new GraphQLNonNull(GraphQLString) },
        cover_image: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const { rows } = await pool.query(
          'INSERT INTO books (title, author, cover_image) VALUES ($1, $2, $3) RETURNING *',
          [args.title, args.author, args.cover_image]
        );
        return rows[0];
      },
    },
    updateBook: {
      type: BookType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLString },
        author: { type: GraphQLString },
        cover_image: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const { rows } = await pool.query(
          'UPDATE books SET title = COALESCE($1, title), author = COALESCE($2, author), cover_image = COALESCE($3, cover_image) WHERE id = $4 RETURNING *',
          [args.title, args.author, args.cover_image, args.id]
        );
        return rows[0];
      },
    },
    deleteBook: {
      type: GraphQLInt,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (parent, args) => {
        await pool.query('DELETE FROM books WHERE id = $1', [args.id]);
        return args.id;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});