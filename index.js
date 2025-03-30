const express = require('express');
const morgan = require('morgan');
const booksRouterV1 = require('./routes/v1/books');
const healthRouter = require('./routes/health');
const errorHandler = require('./middleware/error-handler');
const requestLogger = require('./middleware/request-logger');
const config = require('config');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const queue = require('./utils/queue');
require('./jobs/report-generator'); // Start background job processor
const webhooksRouter = require('./routes/v1/webhooks');
const graphqlRouter = require('./routes/graphql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = config.get('port');

require('./sockets/booksSocket').init(io);

const limiter = rateLimit({
  windowMs: config.get('rateLimit.windowMs'),
  max: config.get('rateLimit.max'),
});

app.use(morgan('dev'));
app.use(express.json());
app.use(limiter);
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/v1/books', booksRouterV1);
app.use('/health', healthRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler);
app.use('/v1/webhooks', webhooksRouter);
app.use('/graphql', graphqlRouter);

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;