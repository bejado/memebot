export const UPDATE_JOB_INPUT = 'jobs/UPDATE_JOB_INPUT'
export const SUBMIT_JOB = 'jobs/SUBMIT_JOB'

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

export const submitJob = () => {
  return dispatch => {
    dispatch({
      type: SUBMIT_JOB
    })
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_JOB_INPUT:
      return {
        ...state,
        jobInput: action.input
      }

    case SUBMIT_JOB:
      return {
        ...state,
        submissionInProgress: true
      }

    default:
      return state
  }
}
