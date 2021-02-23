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
  });
});
