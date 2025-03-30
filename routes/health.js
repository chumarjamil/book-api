const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;