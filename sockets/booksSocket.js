module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('A user connected');
  
      socket.on('bookUpdate', (book) => {
        io.emit('bookUpdated', book);
      });
  
      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
  };