export const UPDATE_JOB_INPUT = 'jobs/UPDATE_JOB_INPUT'

const initialState = {
  jobInput: ''
}

export const updateJobInput = (input) => {
  return dispatch => {
    dispatch({
      type: UPDATE_JOB_INPUT,
      input: input
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

    default:
      return state
  }
}
