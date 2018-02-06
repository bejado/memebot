export const UPDATE_JOB_INPUT = 'jobs/UPDATE_JOB_INPUT'
export const ENQUEUE_JOB = 'jobs/ENQUEUE_JOB'

const POST_JOB = 'jobs/POST_JOB'
const POST_JOB_SUCCESS = 'jobs/POST_JOB_SUCCESS'
const POST_JOB_FAILURE = 'jobs/POST_JOB_FAILURE'

const initialState = {
  jobInput: '',
  submissionInProgress: false
}

export const updateJobInput = (input) => {
  return dispatch => {
    dispatch({
      type: UPDATE_JOB_INPUT,
      input: input
    })
  }
}

const postJob = (message) => {
  return {
    type: POST_JOB,
    message: message
  }
}

const postJobSuccess = (response) => {
  return {
    type: POST_JOB_SUCCESS,
    response: response
  }
}

const postJobFailure = (reason) => {
  return {
    type: POST_JOB_FAILURE,
    reason: reason
  }
}

export const enqueueJob = (message = '') => {
  return dispatch => {
    dispatch(postJob(message))
      const opts = { message };
      return fetch('/api/job', {
        method: 'post',
        body: JSON.stringify(opts),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => {
        if (response.ok) {
          return response.json().then((jsonResponse) => {
            dispatch(postJobSuccess(jsonResponse))
          })
        } else {
          // Assumes that a bad response is in text format
          return response.text().then((reason) => {
            dispatch(postJobFailure(reason))
          })
        }
      });
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_JOB_INPUT:
      return {
        ...state,
        jobInput: action.input
      }

    case POST_JOB:
      return {
        ...state,
        submissionInProgress: true
      }

    case POST_JOB_SUCCESS:
      return {
        ...state,
        submissionInProgress: false,
        submissionSuccess: true,
        submissionResults: action.response
      }

    case POST_JOB_FAILURE:
      return {
        ...state,
        submissionInProgress: false,
        submissionSuccess: false,
        submissionError: action.reason
      }

    default:
      return state
  }
}
