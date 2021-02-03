const request = require('supertest');
const { Customer } = require('../../models/customer');
const { User } = require('../../models/user');

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
    it('should return a customer if vaild id is passed', async () => {
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

    it('should return 404 if invaild id is passed', async () => {
      const res = await request(server).get('/api/customers/1');
      expect(res.status).toBe(404);
    });
  });

  describe('/api/customers', () => {
    describe('POST /', () => {
      it('should return 401 if client is not logged in ', async () => {
        const res = await request(server)
          .post('/api/customers')
          .send({ name: 'customer1', isGold: true, phone: '012345678' });
        expect(res.status).toBe(401);
      });

      it("should return 400 if customer's name is less than 5 characters", async () => {
        const token = new User().generateAuthToken();
        const res = await request(server)
          .post('/api/customers')
          .set('x-auth-token', token)
          .send({ name: '1234', isGold: true, phone: '012345678' });

        expect(res.status).toBe(400);
      });

      it("should return 400 if customer's name is more than 50 characters", async () => {
        const token = new User().generateAuthToken();
        const name = new Array(52).join('a');

        const res = await request(server)
          .post('/api/customers')
          .set('x-auth-token', token)
          .send({ name, isGold: true, phone: '012345678' });

        expect(res.status).toBe(400);
      });

      it("should return 400 if customer's phone is less than 5 characters", async () => {
        const token = new User().generateAuthToken();
        const res = await request(server)
          .post('/api/customers')
          .set('x-auth-token', token)
          .send({ name: '12345', isGold: true, phone: '0123' });

        expect(res.status).toBe(400);
      });

      it("should return 400 if customer's phone is more than 50 characters", async () => {
        const token = new User().generateAuthToken();
        const phone = new Array(52).join('a');

        const res = await request(server)
          .post('/api/customers')
          .set('x-auth-token', token)
          .send({ name: '12345', isGold: true, phone });

        expect(res.status).toBe(400);
      });

      it('should save the customer if it is valid', async () => {
        const token = new User().generateAuthToken();

        await request(server)
          .post('/api/customers')
          .set('x-auth-token', token)
          .send({ name: 'customer1', isGold: true, phone: '012345678' });

        const customer = await Customer.find({
          name: 'customer1',
          isGold: true,
          phone: '012345678',
        });

        console.log(customer);

        expect(customer).not.toBeNull();
      });
    });
  });
});
