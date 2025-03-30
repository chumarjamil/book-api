exports.up = pgm => {
    pgm.createTable('books', {
      id: 'SERIAL PRIMARY KEY',
      title: { type: 'VARCHAR(255)', notNull: true },
      author: { type: 'VARCHAR(255)', notNull: true },
    });
  };
  
  exports.down = pgm => {
    pgm.dropTable('books');
  };