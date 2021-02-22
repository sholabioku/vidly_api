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
});
