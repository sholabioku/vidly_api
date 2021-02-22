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
});
