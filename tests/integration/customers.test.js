const mongoose = require('mongoose');
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

    it('should return 404 if customer with the given id does not exist', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/customers/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;
    const exec = async () => {
      return await request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send({ name, phone });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'customer1';
      phone = '012345678';
    });

    it('should return 401 if client is not logged in ', async () => {
      token = '';
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customer's name is less than 5 characters", async () => {
      name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's name is more than 50 characters", async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is less than 5 characters", async () => {
      name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is more than 50 characters", async () => {
      phone = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the customer if it is valid', async () => {
      await exec();

      const customer = await Customer.find({
        name,
        phone,
      });

      expect(customer).not.toBeNull();
    });

    it('should return the customer if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'customer1');
      expect(res.body).toHaveProperty('isGold', false);
      expect(res.body).toHaveProperty('phone', '012345678');
    });
  });

  describe('PUT /:id', () => {
    let token;
    let newName;
    let newPhone;
    let customer;
    let id;

    const exec = async () => {
      return await request(server)
        .put(`/api/customers/${id}`)
        .set('x-auth-token', token)
        .send({ name: newName, phone: newPhone });
    };

    beforeEach(async () => {
      customer = new Customer({ name: 'customer1', phone: 'phone1' });
      await customer.save();

      token = new User().generateAuthToken();
      newName = 'updatedName';
      newPhone = 'updatedPhone';
      id = customer._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if customer's name is less than 5 characters", async () => {
      newName = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's name is more than 50 characters", async () => {
      newName = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is less than 5 characters", async () => {
      newPhone = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is more than 50 characters", async () => {
      newPhone = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if customer with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should update the customer if input is valid', async () => {
      await exec();
      const customerInDb = await Customer.findById(id);
      expect(customerInDb.name).toBe(newName);
      expect(customerInDb.phone).toBe(newPhone);
    });

    it('should return the customer if input is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
      expect(res.body).toHaveProperty('phone', newPhone);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let customer;
    let id;

    const exec = async () => {
      return await request(server)
        .delete(`/api/customers/${id}`)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach(async () => {
      customer = new Customer({ name: 'customer1', phone: 'phone1' });
      await customer.save();

      token = new User({ isAdmin: true }).generateAuthToken();
      id = customer._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
  });
});
