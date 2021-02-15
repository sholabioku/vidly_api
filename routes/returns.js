const express = require('express');
const moment = require('moment');
const Joi = require('joi');

const router = express.Router();

const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/', [auth, validate(validateReturn)], async (req, res, next) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('Rental not found!');

  if (rental.dateReturned)
    return res.status(400).send('Return already processed.');

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, 'days');
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;
  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    }
  );

  res.status(200).send(rental);
});

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(req);
}

module.exports = router;
