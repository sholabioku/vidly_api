const request = require('supertest');
const { Customer } = require('../../models/customer');

let server;

describe('/api/customers', () => {
  beforeEach(() => {
    server = require('../../index');
  });

  afterEach(async () => {
    server.close();
    await Customer.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all customers', async () => {
      await Customer.collection.insertMany([
        { name: 'customer1', isGold: true, phone: '08012345678' },
        { name: 'customer2', phone: '08012121212' },
      ]);

      const res = await request(server).get('/api/customers');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some((customer) => customer.name === 'customer1')
      ).toBeTruthy();
      expect(
        res.body.some((customer) => customer.name === 'customer2')
      ).toBeTruthy();
    });
  });
});
