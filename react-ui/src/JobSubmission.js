import React from 'react';
import { connect } from 'react-redux';
import {
  updateJobInput,
  enqueueJob,
  pollForJobCompletion
} from './modules/jobSubmission';

const Home = props => (
  <div className="App">
    <p className="App-intro">Input a YouTube video URL:</p>
    <input
      type="text"
      value={props.inputValue}
      onChange={e => props.handleInputChange(e.target.value)}
    />
    <button onClick={() => props.enqueueJob(props.inputValue)}>Go!</button>
    {props.shouldShowLoading ? <div>Loading...</div> : null}
    {props.videoUrl ? <video src={props.videoUrl} controls autoPlay /> : null}
    {props.error ? (
      <div>
        <p>
          Whoops. An error occurred :/<br />Try again later
        </p>
        <p>{props.error}</p>
      </div>
    ) : null}
  </div>
);

const errorMessage = state => {
  const job = state.jobs.job;
  if (job && (job.status === 'error' || job.error)) {
    return job.error || 'Error while processing video';
  }
  return state.jobs.submission.error || false;
};

const mapStateToProps = state => ({
  inputValue: state.jobs.submission.messageInput,
  error: errorMessage(state),
  shouldShowLoading:
    state.jobs.submission.submitting ||
    (state.jobs.job ? state.jobs.job.polling : false),
  videoUrl: state.jobs.job ? state.jobs.job.url : null
});

const mapDispatchToProps = dispatch => {
  return {
    handleInputChange: input => dispatch(updateJobInput(input)),
    enqueueJob: message => {
      dispatch(enqueueJob(message))
        .then(
          id => dispatch(pollForJobCompletion(id)),
          err => console.error(`An error occurred submitting the job: ${err}`)
        )
        .catch(err => console.error(`An error occurred: ${err}`));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
