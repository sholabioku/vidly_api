const express = require('express');
const router = express.Router();

router.post('/', (req, res, next) => {
  if (!req.body.customerId)
    return res.status(400).send('CustomerId not provided');

  if (!req.body.movieId) return res.status(400).send('MovieId not provided');

  res.status(401).send('Unauthorized!');
});

module.exports = router;
