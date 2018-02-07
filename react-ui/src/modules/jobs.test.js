import fetchMock from 'fetch-mock';
import jobReducer, { enqueueJob, POST_JOB, POST_JOB_SUCCESS } from './jobs';
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

describe('job reducer', () => {
  it('should return the initial state', () => {
    expect(jobReducer(undefined, {})).toEqual({
      jobInput: '',
      submissionInProgress: false
    });
  });

  it('should handle POST_JOB', () => {
    expect(
      jobReducer([], {
        type: POST_JOB,
        message: 'test message'
      })
    ).toEqual({
      jobInput: '', // jobInput should be cleared
      submissionInProgress: true
    });
  });
});
