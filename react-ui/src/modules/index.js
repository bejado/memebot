import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import jobSubmissionReducer from './jobSubmission';

export default combineReducers({
  jobSubmission: jobSubmissionReducer,
  routing: routerReducer
});
