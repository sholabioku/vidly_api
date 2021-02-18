const request = require('supertest');
const { Movie } = require('../../models/movie');

describe('/api/movies', () => {
  let server;

  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(async () => {
    await server.close();
    await Movie.deleteMany({});
  });

  describe('GET /', () => {
    it('should get all movies', async () => {
      await Movie.collection.insertMany([
        {
          title: '12345',
          dailyRentalRate: 2,
          genre: { name: '12345' },
          numberInStock: 10,
        },
        {
          title: '67890',
          dailyRentalRate: 4,
          genre: { name: '67890' },
          numberInStock: 20,
        },
      ]);

      const res = await request(server).get('/api/movies');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((movie) => movie.title === '12345')).toBeTruthy();
    });
  });
});
