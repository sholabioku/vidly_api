const mongoose = require('mongoose');
const request = require('supertest');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');

describe('/api/rentals', () => {
  let server;

  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
  });

  describe('GET /', () => {
    it('should get all rentals', async () => {
      await Rental.collection.insertMany([
        {
          customer: {
            name: '12345',
            phone: '12345',
          },
          movie: {
            title: '12345',
            dailyRentalRate: 2,
          },
        },
      ]);

      const res = await request(server).get('/api/rentals');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /:id', () => {
    it('should return a rental if valid id is passed', async () => {
      const rental = new Rental({
        customer: {
          name: '12345',
          phone: '12345',
        },
        movie: {
          title: '12345',
          dailyRentalRate: 2,
        },
      });

      await rental.save();

      const res = await request(server).get(`/api/rentals/${rental._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
    });

    it('should return 404 if movie with the id does not exist', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/rentals/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let customerId;
    let movieId;
    let rental;

    const exec = async () => {
      return await request(server)
        .post('/api/rentals')
        .set('x-auth-token', token)
        .send({ customerId, movieId });
    };

    beforeEach(async () => {
      customerId = mongoose.Types.ObjectId();
      movieId = mongoose.Types.ObjectId();
      token = new User().generateAuthToken();

      // movie = new Movie({
      //   _id: movieId,
      //   title: '12345',
      //   dailyRentalRate: 2,
      //   genre: { name: '12345' },
      //   numberInStock: 10,
      // });

      // await movie.save();

      rental = new Rental({
        customer: {
          _id: customerId,
          name: '12345',
          phone: '12345',
        },
        movie: {
          _id: movieId,
          title: '12345',
          dailyRentalRate: 2,
        },
      });
      await rental.save();
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();
      expect(res.status).toBe(401);
    });
  });
});
