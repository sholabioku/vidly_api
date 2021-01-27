const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function () {
  mongoose
    .connect('mongodb://localhost/vidly', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => winston.info('Connected to MongoDB...'));
};
