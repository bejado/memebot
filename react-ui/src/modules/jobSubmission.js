export const UPDATE_JOB_INPUT = 'jobs/UPDATE_JOB_INPUT';

export const POST_JOB = 'jobs/POST_JOB';
export const POST_JOB_SUCCESS = 'jobs/POST_JOB_SUCCESS';
export const POST_JOB_FAILURE = 'jobs/POST_JOB_FAILURE';

export const POLLING_JOB = 'jobs/POLLING_JOB';
export const JOB_COMPLETED = 'jobs/JOB_COMPLETED';

// Mock our endpoints for easier frontend development if the REACT_APP_MOCK_SERVER env var is set
if (process.env.REACT_APP_MOCK_SERVER) {
  require('./mock_jobs.js');
}

const initialState = {
  submission: {
    messageInput: '',
    submitting: false,
    error: null
  },
  job: null
};

export const updateJobInput = input => {
  return dispatch => {
    dispatch({
      type: UPDATE_JOB_INPUT,
      input: input
    });
  };
};

const postJobStart = message => {
  return {
    type: POST_JOB,
    message: message
  };
};

const postJobSuccess = response => {
  return {
    type: POST_JOB_SUCCESS,
    response: response
  };
};

const postJobFailure = reason => {
  return {
    type: POST_JOB_FAILURE,
    reason: reason
  };
};

const pollingJob = id => {
  return {
    type: POLLING_JOB
  };
};

const jobCompleted = url => {
  return {
    type: JOB_COMPLETED,
    url: url
  };
};

const postJob = async message => {
  const opts = { message };
  return await fetch('/api/job', {
    method: 'post',
    body: JSON.stringify(opts),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
};

export const enqueueJob = (message = '') => {
  return async dispatch => {
    dispatch(postJobStart(message));
    const response = await postJob(message);
    if (response.ok) {
      const responseJson = await response.json();
      dispatch(postJobSuccess(responseJson));
      return responseJson.id;
    } else {
      const reason = await response.text();
      dispatch(postJobFailure(reason));
      throw reason;
    }
  };
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const getJob = id => {
  return fetch(`/api/job/${id}`).then(response => response.json());
};

const pollJob = (id, ms = 300) => {
  return getJob(id).then(response => {
    if (response.status === 'complete') {
      console.log('Job is complete!');
      return response.url;
    } else {
      console.log('Job is not complete');
      return wait(ms).then(() => pollJob(id, ms * 2));
    }
  });
};

export const pollForJobCompletion = id => {
  return dispatch => {
    dispatch(pollingJob(id));
    return pollJob(id).then(resultUrl => dispatch(jobCompleted(resultUrl)));
  };
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_JOB_INPUT:
      return {
        ...state,
        submission: {
          ...state.submission,
          messageInput: action.input
        }
      };

    case POST_JOB:
      return {
        ...state,
        submission: {
          ...state.submission,
          messageInput: '',
          submitting: true,
          error: null
        }
      };

    case POST_JOB_SUCCESS:
      return {
        ...state,
        submission: {
          ...state.submission,
          submitting: false,
          error: null
        },
        job: {
          id: action.response.id,
          url: null,
          polling: false,
          error: null
        }
      };

    case POST_JOB_FAILURE:
      return {
        ...state,
        submission: {
          ...state.submission,
          submitting: false,
          error: action.reason
        }
      };

    case POLLING_JOB:
      return {
        ...state,
        job: {
          ...state.job,
          polling: true
        }
      };

    case JOB_COMPLETED:
      return {
        ...state,
        job: {
          ...state.job,
          url: action.url,
          polling: false
        }
      };

    default:
      return state;
  }
};
