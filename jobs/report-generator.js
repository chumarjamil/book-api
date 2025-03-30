const queue = require('../utils/queue');
const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function generateReport(job) {
  try {
    const { rows } = await pool.query('SELECT * FROM books');
    const report = JSON.stringify(rows, null, 2);

    fs.writeFileSync(path.join(__dirname, `report-${job.id}.json`), report);
    console.log(`Report ${job.id} generated`);
  } catch (err) {
    console.error(`Error generating report ${job.id}:`, err);
  }
}

queue.process('generateReport', generateReport);

module.exports = generateReport;