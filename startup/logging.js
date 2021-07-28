require('express-async-errors');
const winston = require('winston');
require('winston-mongodb');

module.exports = function () {
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
      db: 'mongodb+srv://bilush:bilush@cluster0.sjemq.mongodb.net/vidly?retryWrites=true&w=majority',
      options: {
        useUnifiedTopology: true,
      },
      level: 'info',
    })
  );
  winston.add(
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
};
