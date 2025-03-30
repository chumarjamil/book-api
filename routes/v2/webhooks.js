const express = require('express');
const { validationResult, body } = require('express-validator');
const pool = require('../../db');
const router = express.Router();
const auth = require('../../middleware/auth');

router.post('/', auth, [
  body('url').isURL(),
  body('event').isIn(['book.created', 'book.updated', 'book.deleted']),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { url, event } = req.body;
    const { rows } = await pool.query('INSERT INTO webhooks (url, event) VALUES ($1, $2) RETURNING *', [url, event]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM webhooks');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM webhooks WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;