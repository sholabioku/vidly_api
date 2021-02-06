const request = require('supertest');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');

describe('auth middleware', () => {
  let server;
  let token;
  let name;

  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(async () => {
    await Genre.deleteMany({});
    server.close();
  });

  const exec = () => {
    return request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
    name = 'genre1';
  });

  it('should return 401 if no token is providedd', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if invalid token is provided', async () => {
    token = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
