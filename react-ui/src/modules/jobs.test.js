import fetchMock from 'fetch-mock';
import { enqueueJob, POST_JOB, POST_JOB_SUCCESS } from './jobs';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async job actions', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('creates POST_JOB and POST_JOB_SUCCESS when enqueuing a job', () => {
    fetchMock.postOnce('/api/job', { body: { success: true, id: 'abcdef' } });

    const expectedActions = [
      { type: POST_JOB, message: 'test message' },
      {
        type: POST_JOB_SUCCESS,
        response: {
          success: true,
          id: 'abcdef'
        }
      }
    ];

    const store = mockStore({});
    return store.dispatch(enqueueJob('test message')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
