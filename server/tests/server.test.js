const request = require('supertest');

const normalQueue = () => {
  jest.doMock('../queue', () => ({
    enqueue: jest.fn().mockResolvedValue()
  }));
};

const normalDatabase = () => {
  jest.doMock('../database', () => ({
    getJobStatus: jest.fn().mockResolvedValue({
      id: 'abc',
      status: 'pending',
      url: ''
    }),
    createJob: jest.fn().mockResolvedValue()
  }));
};

const databaseJobDoesNotExist = () => {
  jest.doMock('../database', () => ({
    getJobStatus: jest.fn(() => Promise.reject(new Error('Job not found'))),
    createJob: jest.fn().mockResolvedValue()
  }));
};

const databaseError = () => {
  jest.doMock('../database', () => ({
    getJobStatus: jest.fn(() => Promise.reject(new Error('Unexpected error'))),
    createJob: jest.fn(() => Promise.reject(new Error('Unexpected error')))
  }));
};

describe('GET /api/job/:job_id ', () => {
  beforeEach(() => {
    jest.resetModules();
    normalQueue();
    normalDatabase();
  });

  test('response type is JSON', done => {
    const app = require('../app');

    request(app)
      .get('/api/job/abcdef')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(require('../database').getJobStatus).toBeCalledWith('abcdef');
        done();
      });
  });

  test('responds with an error if job does not exist', done => {
    databaseJobDoesNotExist();
    const app = require('../app');

    request(app)
      .get('/api/job/badjob')
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (err) throw err;
        expect(res.body.error).toEqual('Job not found');
        done();
      });
  });
});

describe('POST /api/job', () => {
  beforeEach(() => {
    jest.resetModules();
    normalQueue();
    normalDatabase();
  });

  test('response type is JSON', done => {
    const app = require('../app');

    request(app)
      .post('/api/job')
      .send({
        message: 'test message abc'
      })
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(require('../queue').enqueue).toBeCalledWith('test message abc');
        done();
      });
  });

  test('responds with an error if message is empty', done => {
    const app = require('../app');

    request(app)
      .post('/api/job')
      .send({
        message: ''
      })
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /html/)
      .expect(400)
      .end((err, res) => {
        if (err) throw err;
        done();
      });
  });

  test('responds with an error if unable to create the job', done => {
    databaseError();
    const app = require('../app');

    request(app)
      .post('/api/job')
      .send({
        message: 'some message'
      })
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /html/)
      .expect(500)
      .end((err, res) => {
        if (err) throw err;
        done();
      });
  });
});
