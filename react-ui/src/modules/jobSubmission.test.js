import fetchMock from 'fetch-mock';
import jobReducer, {
  enqueueJob,
  UPDATE_JOB_INPUT,
  POST_JOB,
  POST_JOB_SUCCESS,
  POST_JOB_FAILURE,
  POLLING_JOB,
  JOB_COMPLETED
} from './jobSubmission';
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

  it('creates POST_JOB and POST_JOB_FAILURE when server returns a 400', () => {
    fetchMock.postOnce('/api/job', {
      body: 'A message is required',
      status: 400
    });

    const expectedActions = [
      { type: POST_JOB, message: 'invalid message' },
      {
        type: POST_JOB_FAILURE,
        reason: 'A message is required'
      }
    ];

    const store = mockStore({});
    return store.dispatch(enqueueJob('invalid message')).then(
      () => {},
      reason => {
        expect(store.getActions()).toEqual(expectedActions);
        expect(reason).toEqual('A message is required');
      }
    );
  });
});

describe('job reducer', () => {
  const initialState = {
    submission: {
      messageInput: '',
      submitting: false,
      error: null
    },
    job: null
  };

  it('should return the initial state', () => {
    expect(jobReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle UPDATE_JOB_INPUT', () => {
    expect(
      jobReducer(
        {
          submission: {
            messageInput: '',
            submitting: false,
            error: null
          },
          job: null
        },
        {
          type: UPDATE_JOB_INPUT,
          input: 'abc'
        }
      )
    ).toEqual({
      submission: {
        messageInput: 'abc',
        submitting: false,
        error: null
      },
      job: null
    });
  });

  it('should handle POST_JOB', () => {
    expect(
      jobReducer(
        {
          submission: {
            messageInput: 'a message',
            submitting: false,
            error: null
          },
          job: null
        },
        {
          type: POST_JOB,
          message: 'test message'
        }
      )
    ).toEqual({
      submission: {
        messageInput: '', // messageInput should be cleared
        submitting: true,
        error: null
      },
      job: null
    });
  });

  it('should handle POST_JOB and clear the previous job', () => {
    expect(
      jobReducer(
        {
          submission: {
            messageInput: 'a message',
            submitting: false,
            error: null
          },
          job: {
            id: 'defghi',
            url: 'http://test.url',
            polling: false,
            error: null
          }
        },
        {
          type: POST_JOB,
          message: 'a new message'
        }
      )
    ).toEqual({
      submission: {
        messageInput: '', // messageInput should be cleared
        submitting: true,
        error: null
      },
      job: null // job should also be cleared
    });
  });

  it('should handle POST_JOB_SUCCESS', () => {
    expect(
      jobReducer(
        {
          submission: {
            messageInput: '',
            submitting: true,
            error: null
          },
          job: null
        },
        {
          type: POST_JOB_SUCCESS,
          response: { success: true, id: 'abcdef' }
        }
      )
    ).toEqual({
      submission: {
        messageInput: '',
        submitting: false,
        error: null
      },
      job: {
        id: 'abcdef',
        url: null,
        polling: false,
        error: null
      }
    });
  });

  it('should handle POST_JOB_FAILURE', () => {
    expect(
      jobReducer(
        {
          submission: {
            messageInput: '',
            submitting: true,
            error: null
          },
          job: null
        },
        {
          type: POST_JOB_FAILURE,
          reason: 'something went wrong'
        }
      )
    ).toEqual({
      submission: {
        messageInput: '',
        submitting: false,
        error: 'something went wrong'
      },
      job: null
    });
  });

  it('should handle POLLING_JOB', () => {
    expect(
      jobReducer(
        {
          submission: {
            messageInput: '',
            submitting: false,
            error: null
          },
          job: {
            id: 'abcdef',
            url: null,
            polling: false,
            error: null
          }
        },
        {
          type: POLLING_JOB
        }
      )
    ).toEqual({
      submission: {
        messageInput: '',
        submitting: false,
        error: null
      },
      job: {
        id: 'abcdef',
        url: null,
        polling: true,
        error: null
      }
    });
  });

  it('should handle JOB_COMPLETED', () => {
    expect(
      jobReducer(
        {
          submission: {
            messageInput: '',
            submitting: false,
            error: null
          },
          job: {
            id: 'abcdef',
            url: null,
            polling: true,
            error: null
          }
        },
        {
          type: JOB_COMPLETED,
          url: 'http://test.url'
        }
      )
    ).toEqual({
      submission: {
        messageInput: '',
        submitting: false,
        error: null
      },
      job: {
        id: 'abcdef',
        url: 'http://test.url',
        polling: false,
        error: null
      }
    });
  });
});
