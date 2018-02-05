import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import jobsReducer from './jobs'

export default combineReducers({
  jobs: jobsReducer,
  routing: routerReducer,
})

