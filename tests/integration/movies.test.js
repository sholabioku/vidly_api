const mongoose = require('mongoose');
const request = require('supertest');

const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');

describe('/api/movies', () => {
  let server;

  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
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

  describe('GET /:id', () => {
    it('should return a movie if valid id is passed', async () => {
      const movie = new Movie({
        title: '12345',
        dailyRentalRate: 2,
        genre: { name: '12345' },
        numberInStock: 10,
      });

      await movie.save();

      const res = await request(server).get(`/api/movies/${movie._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', '12345');
    });

    it('should return 404 if movie with the id does not exist', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/movies/${id}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 if id is invalid', async () => {
      const res = await request(server).get(`/api/movies/1`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let title;
    let genre;
    let genreId;
    let dailyRentalRate;
    let numberInStock;

    const exec = async () => {
      return await request(server)
        .post('/api/movies')
        .set('x-auth-token', token)
        .send({ title, genreId, dailyRentalRate, numberInStock });
    };

    beforeEach(async () => {
      genre = new Genre({ name: '12345' });
      await genre.save();

      token = new User().generateAuthToken();
      title = '12345';
      genreId = genre._id;
      dailyRentalRate = 2;
      numberInStock = 10;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 5 characters', async () => {
      title = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is more than 50 characters', async () => {
      title = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid genre', async () => {
      genreId = 1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the movie if it is valid', async () => {
      await exec();
      const movie = await Movie.find({
        title,
        genreId,
        dailyRentalRate,
        numberInStock,
      });

      expect(movie).not.toBeNull();
    });
  });
});
