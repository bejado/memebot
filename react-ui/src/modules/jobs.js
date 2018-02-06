export const UPDATE_JOB_INPUT = 'jobs/UPDATE_JOB_INPUT'
export const ENQUEUE_JOB = 'jobs/ENQUEUE_JOB'

const POST_JOB = 'jobs/POST_JOB'
const POST_JOB_SUCCESS = 'jobs/POST_JOB_SUCCESS'
const POST_JOB_FAILURE = 'jobs/POST_JOB_FAILURE'

const POLLING_JOB = 'jobs/POLLING_JOB'
const JOB_COMPLETED = 'jobs/JOB_COMPLETED'

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

const pollingJob = (id) => {
  return {
    type: POLLING_JOB
  }
}

const jobCompleted = (url) => {
  return {
    type: JOB_COMPLETED,
    url: url
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
          return jsonResponse.id
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

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const getJob = (id) => {
  return fetch(`/api/job/${id}`)
    .then(response => response.json())
}

const pollJob = (id, ms = 300) => {
  return getJob(id).then((response) => {
    if (response.status === 'complete') {
      console.log('Job is complete!')
      return response.url;
    } else {
      console.log('Job is not complete')
      return wait(ms).then(() => pollJob(id, ms * 2))
    }
  })
}

export const pollForJobCompletion = (id) => {
  return dispatch => {
    dispatch(pollingJob(id))
    return pollJob(id)
      .then((resultUrl) => dispatch(jobCompleted(resultUrl)))
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

    case POLLING_JOB:
      return {
        ...state,
        pollingForJobCompletion: true
      }

    case JOB_COMPLETED:
      return {
        ...state,
        pollingForJobCompletion: false,
        jobUrl: action.url
      }

    default:
      return state
  }
}
