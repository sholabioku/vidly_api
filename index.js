require('express-async-errors');
const config = require('config');
const winston = require('winston');
require('winston-mongodb');
const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const app = express();

require('./startup/routes')(app);

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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
