const express = require('express');
const router = express.Router();

router.post('/', (req, res, next) => {
  res.status(401).send('Unauthorized!');
});

module.exports = router;
