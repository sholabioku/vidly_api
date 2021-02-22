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
    let genre;
    let genreId;
    let movie;
    let movieId;
    let title;
    let dailyRentalRate;
    let numberInStock;

    const exec = async () => {
      return await request(server)
        .post('/api/movies')
        .set('x-auth-token', token)
        .send({
          title,
          genreId,
          dailyRentalRate,
          numberInStock,
        });
    };

    beforeEach(async () => {
      genre = new Genre({ name: '12345' });
      await genre.save();

      token = new User().generateAuthToken();
      movieId = mongoose.Types.ObjectId();
      title = '12345';
      dailyRentalRate = 10;
      numberInStock = 2;
      genreId = genre._id;

      movie = new Movie({
        _id: movieId,
        title,
        genre: { _id: genreId, name: '12345' },
        dailyRentalRate,
        numberInStock,
      });

      await movie.save();
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

    it('should return 400 if invalid genre is passed', async () => {
      genreId = 1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not a number', async () => {
      dailyRentalRate = 'a';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is negative number', async () => {
      dailyRentalRate = -1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is not a number', async () => {
      numberInStock = 'a';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is negative number', async () => {
      numberInStock = -1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the movie if input is valid', async () => {
      await exec();

      const movieInDb = await Movie.find({
        _id: movieId,
        title,
        genre: { _id: genre._id, name: '12345' },
        dailyRentalRate,
        numberInStock,
      });

      expect(movieInDb).not.toBeNull();
    });

    it('should return the movie if input is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', '12345');
    });
  });

  describe('PUT /:id', () => {
    let token;
    let newTitle;
    let newDailyRentalRate;
    let newNumberInStock;
    let id;
    let movie;
    let movieId;
    let genreId;
    let genre;

    const exec = async () => {
      return await request(server)
        .put(`/api/movies/${id}`)
        .set('x-auth-token', token)
        .send({
          title: newTitle,
          genreId,
          dailyRentalRate: newDailyRentalRate,
          numberInStock: newNumberInStock,
        });
    };

    beforeEach(async () => {
      genre = new Genre({ name: '12345' });
      await genre.save();

      token = new User().generateAuthToken();
      movieId = mongoose.Types.ObjectId();
      newTitle = 'updatedTitle';
      newDailyRentalRate = 20;
      newNumberInStock = 4;
      genreId = genre._id;

      movie = new Movie({
        _id: movieId,
        title: '12345',
        genre: { _id: genreId, name: '12345' },
        dailyRentalRate: 10,
        numberInStock: 2,
      });

      await movie.save();

      id = movie._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 if title is less than 5 characters', async () => {
      newTitle = '1234';

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is more than 50 characters', async () => {
      newTitle = new Array(52).join('a');

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid genre is passed', async () => {
      genreId = 1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not a number', async () => {
      newDailyRentalRate = 'a';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is negative number', async () => {
      newDailyRentalRate = -1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is not a number', async () => {
      newNumberInStock = 'a';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is negative number', async () => {
      newNumberInStock = -1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid id is passed', async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if no movie for the id  passed', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should update the movie if input is vaild', async () => {
      await exec();
      const updatedMovie = await Movie.findById(id);
      expect(updatedMovie.title).toBe(newTitle);
    });

    it('should return the movie if input is vaild', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'updatedTitle');
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let newTitle;
    let newDailyRentalRate;
    let newNumberInStock;
    let id;
    let movie;
    let movieId;
    let genreId;
    let genre;

    const exec = async () => {
      return await request(server)
        .put(`/api/movies/${id}`)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach(async () => {
      genre = new Genre({ name: '12345' });
      await genre.save();

      token = new User().generateAuthToken();
      movieId = mongoose.Types.ObjectId();
      genreId = genre._id;

      movie = new Movie({
        _id: movieId,
        title: '12345',
        genre: { _id: genreId, name: '12345' },
        dailyRentalRate: 10,
        numberInStock: 2,
      });

      await movie.save();

      id = movie._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
  });
});
