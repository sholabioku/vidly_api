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
    it('should create a user', async () => {
      const name = 'Lukman Bioku';
      const email = 'example@example.com';
      const password = '123mnb!';

      const res = await request(server)
        .post('/api/users')
        .send({ name, email, password });
      expect(res.status).toBe(200);

      const user = await User.findOne({ email });
      expect(user).toBeTruthy();
      expect(user).toHaveProperty('_id');
      // expect(user.password).not.toBe(password);
    });
  });
});
