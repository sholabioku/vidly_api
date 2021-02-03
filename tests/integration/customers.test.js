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

  describe('GET /:id', () => {
    it('should return the customer if vaild id is passed', async () => {
      const customer = new Customer({
        name: 'customer1',
        isGold: true,
        phone: '012345678',
      });
      await customer.save();

      const res = await request(server).get(`/api/customers/${customer._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', customer.name);
      expect(res.body).toHaveProperty('isGold', customer.isGold);
      expect(res.body).toHaveProperty('phone', customer.phone);
    });
  });
});
