const mongoose = require('mongoose');
const request = require('supertest');

const { User } = require('../../models/user');

describe('/api/users', () => {
  let server;

  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe('GET /me', () => {
    it('should return 200 if user is authenticated', async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .get('/api/users/me')
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(server).get('/api/users/me');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /', () => {
    let userOne;
    let userTwo;

    beforeEach(async () => {
      userOne = new User({
        name: 'Lukman Bioku',
        email: 'example@example.com',
        password: '123mnb!',
      });

      await userOne.save();

      userTwo = new User({
        name: 'Shola Bioku',
        email: 'shola@gmail.com',
        password: 'userTwoPass',
      });
      await userTwo.save();
    });
    it('should create a user', async () => {
      const name = 'Bilush';
      const email = 'bilush@example.com';
      const password = '123mnb!';

      const res = await request(server)
        .post('/api/users')
        .send({ name, email, password });
      expect(res.status).toBe(200);

      const user = await User.findOne({ email });
      expect(user).toBeTruthy();
      expect(user).toHaveProperty('_id');
      expect(user.password).not.toBe(password);
    });

    it('should return 400 if user is already registered', async () => {
      const name = 'Lukman Bioku';
      const email = 'example@example.com';
      const password = '123mnb!';
      const res = await request(server)
        .post('/api/users')
        .send({ name, email, password });
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is less than 5 characters', async () => {
      const name = '1234';
      const email = 'example1@example.com';
      const password = '123mnb!';
      const res = await request(server)
        .post('/api/users')
        .send({ name, email, password });
      expect(res.status).toBe(400);
    });
  });
});
