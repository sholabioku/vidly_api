const express = require('express');
const genres = require('./routes/genres');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(helmet());

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
}

app.use('/api/genres', genres);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
