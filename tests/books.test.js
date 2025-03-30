// tests/books.test.js
const request = require('supertest');
const app = require('../index');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('Book API', () => {
  let token;

  beforeAll(async () => {
    await pool.query('CREATE TABLE IF NOT EXISTS books (id SERIAL PRIMARY KEY, title VARCHAR(255), author VARCHAR(255))');
    token = jwt.sign({ userId: 1 }, config.get('jwtSecret'));
  });

  afterEach(async () => {
    await pool.query('DELETE FROM books');
  });

  it('should get all books', async () => {
    await pool.query('INSERT INTO books (title, author) VALUES ($1, $2)', ['Test Book 1', 'Test Author 1']);
    await pool.query('INSERT INTO books (title, author) VALUES ($1, $2)', ['Test Book 2', 'Test Author 2']);

    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('Test Book 1');
    expect(res.body[1].title).toBe('Test Book 2');
  });

  it('should get a book by id', async () => {
    const insertedBook = await pool.query("INSERT INTO books (title, author) VALUES ('Specific Book', 'Specific Author') RETURNING *");
    const res = await request(app).get(`/books/${insertedBook.rows[0].id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(insertedBook.rows[0].id);
    expect(res.body.title).toBe('Specific Book');
  });

  it('should return 404 if book id not found', async () => {
    const res = await request(app).get('/books/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Book not found');
  });

  it('should create a new book', async () => {
    const res = await request(app)
      .post('/books')
      .set('x-auth-token', token)
      .send({ title: 'New Book', author: 'New Author' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('New Book');
    expect(res.body.author).toBe('New Author');

    const books = await pool.query('SELECT * FROM books');
    expect(books.rows.length).toBe(1);
    expect(books.rows[0].title).toBe('New Book');
  });

  it('should return 400 if title or author is missing', async () => {
    const res = await request(app)
      .post('/books')
      .set('x-auth-token', token)
      .send({ title: 'Missing Author' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();

    const res2 = await request(app)
      .post('/books')
      .set('x-auth-token', token)
      .send({ author: 'Missing Title' });
    expect(res2.statusCode).toBe(400);
    expect(res2.body.errors).toBeDefined();
  });

  it('should update a book', async () => {
    const insertedBook = await pool.query("INSERT INTO books (title, author) VALUES ('Original Book', 'Original Author') RETURNING *");
    const res = await request(app)
      .put(`/books/${insertedBook.rows[0].id}`)
      .set('x-auth-token', token)
      .send({ title: 'Updated Book', author: 'Updated Author' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Book');
    expect(res.body.author).toBe('Updated Author');

    const updatedBook = await pool.query('SELECT * FROM books WHERE id = $1', [insertedBook.rows[0].id]);
    expect(updatedBook.rows[0].title).toBe('Updated Book');
  });

  it('should return 404 if updating non-existent book', async () => {
    const res = await request(app)
      .put('/books/999')
      .set('x-auth-token', token)
      .send({ title: 'Updated Book', author: 'Updated Author' });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Book not found');
  });

  it('should delete a book', async () => {
    const insertedBook = await pool.query("INSERT INTO books (title, author) VALUES ('Book to Delete', 'Delete Author') RETURNING *");
    const res = await request(app).delete(`/books/${insertedBook.rows[0].id}`).set('x-auth-token', token);
    expect(res.statusCode).toBe(204);

    const books = await pool.query('SELECT * FROM books');
    expect(books.rows.length).toBe(0);
  });

  it('should return 404 if deleting non-existent book', async () => {
    const res = await request(app).delete('/books/999').set('x-auth-token', token);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Book not found');
  });
});