const express = require('express');
const { validationResult, query } = require('express-validator');
const pool = require('../../db');
const router = express.Router();
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/roles');
const cache = require('../../utils/cache');
const multer = require('multer');
const io = require('../../sockets/booksSocket').getIO();
const validator = require('../../utils/validator');
const axios = require('axios');
const escape = require('escape-html');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
  },
});

const upload = multer({ storage: storage });

async function triggerWebhooks(event, data) {
  try {
    const { rows } = await pool.query('SELECT url FROM webhooks WHERE event = $1', [event]);
    rows.forEach(async (row) => {
      try {
        await axios.post(row.url, data);
      } catch (err) {
        console.error(`Error sending webhook to ${row.url}:`, err.message);
      }
    });
  } catch (err) {
    console.error('Error fetching webhooks:', err.message);
  }
}

// GET all books with search, pagination, and sorting (optimized)
router.get('/', [
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('sortBy').optional().isIn(['title', 'author']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { search, page = 1, limit = 10, sortBy = 'title', sortOrder = 'asc' } = req.query;
  const offset = (page - 1) * limit;

  try {
    let queryStr = 'SELECT id, title, author, cover_image FROM books';
    const queryParams = [];

    if (search) {
      queryStr += ' WHERE title ILIKE $1 OR author ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    queryStr += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const { rows } = await pool.query(queryStr, queryParams);

    const encodedRows = rows.map((book) => ({
      id: book.id,
      title: escape(book.title),
      author: escape(book.author),
      cover_image: book.cover_image ? escape(book.cover_image) : null,
    }));

    res.json(encodedRows);
  } catch (err) {
    next(err);
  }
});

// GET a specific book (with caching)
router.get('/:id', cache.route(), async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, title, author, cover_image FROM books WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });

    const encodedBook = {
      id: rows[0].id,
      title: escape(rows[0].title),
      author: escape(rows[0].author),
      cover_image: rows[0].cover_image ? escape(rows[0].cover_image) : null,
    };

    res.json(encodedBook);
  } catch (err) {
    next(err);
  }
});

// POST a new book (with file upload and real time update)
router.post('/', auth, authorize(['admin']), upload.single('coverImage'), async (req, res, next) => {
  const { error } = validator.validateBook(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { title, author } = req.body;
    const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const { rows } = await pool.query('INSERT INTO books (title, author, cover_image) VALUES ($1, $2, $3) RETURNING id, title, author, cover_image', [title, author, coverImageUrl]);
    const insertedBook = rows[0];

    io.emit('bookUpdated', insertedBook);
    await triggerWebhooks('book.created', insertedBook);

    const encodedInsertedBook = {
        id: insertedBook.id,
        title: escape(insertedBook.title),
        author: escape(insertedBook.author),
        cover_image: insertedBook.cover_image ? escape(insertedBook.cover_image) : null,
    }

    res.status(201).json(encodedInsertedBook);
  } catch (err) {
    next(err);
  }
});

// PUT update a book
router.put('/:id', auth, authorize(['admin']), async (req, res, next) => {
  const { error } = validator.validateBook(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { title, author } = req.body;
    const { rows } = await pool.query('UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING id, title, author, cover_image', [title, author, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });
    const updatedBook = rows[0];

    io.emit('bookUpdated', updatedBook);
    await triggerWebhooks('book.updated', updatedBook);

    const encodedUpdatedBook = {
        id: updatedBook.id,
        title: escape(updatedBook.title),
        author: escape(updatedBook.author),
        cover_image: updatedBook.cover_image ? escape(updatedBook.cover_image) : null,
    }

    res.json(encodedUpdatedBook);
  } catch (err) {
    next(err);
  }
});

// DELETE a book
router.delete('/:id', auth, authorize(['admin']), async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM books WHERE id = $1 RETURNING id', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });
    res.status(204).send();

    io.emit('bookDeleted', req.params.id);
    await triggerWebhooks('book.deleted', { id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;