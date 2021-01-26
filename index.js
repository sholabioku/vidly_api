require('express-async-errors');
const config = require('config');
const winston = require('winston');
require('winston-mongodb');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');
const error = require('./middleware/error');

const app = express();

winston.exceptions.handle(
  new winston.transports.File({ filename: 'uncaughtExceptions' })
);

process.on('unhandledRejection', (ex) => {
  throw ex;
});

winston.add(
  new winston.transports.File({
    filename: 'logfile.log',
  })
);
winston.add(
  new winston.transports.MongoDB({
    db: 'mongodb://localhost/vidly',
    options: {
      useUnifiedTopology: true,
    },
    level: 'info',
  })
);

const p = Promise.reject(new Error('Something failed miserably!'));
p.then(() => console.log('Done'));

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined');
  process.exit(1);
}

mongoose
  .connect('mongodb://localhost/vidly', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use(helmet());

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
}

app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);

app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
