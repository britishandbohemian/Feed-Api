const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Adjust path if needed
const { expect } = chai;

chai.use(chaiHttp);

let jwtToken; // To store JWT token

describe('API Testing', () => {
  it('Register a new user', (done) => {
    chai
      .request(server)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'testpassword' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('Login a user', (done) => {
    chai
      .request(server)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'testpassword' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        jwtToken = res.body.token; // Save the token for future requests
        done();
      });
  });

  it('Get all tasks', (done) => {
    chai
      .request(server)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${jwtToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('Create a new task', (done) => {
    chai
      .request(server)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'Test Task', description: 'Task Description' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });
});
