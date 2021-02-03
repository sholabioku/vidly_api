const request = require('supertest');

let server;

describe('/api/customers', () => {
  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /', () => {
    it('should return all customers', async () => {
      const res = await request(server).get('/api/customers');
      expect(res.status).toBe(200);
    });
  });
});
