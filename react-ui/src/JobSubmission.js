import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  updateJobInput,
  enqueueJob,
  pollForJobCompletion
} from './modules/jobSubmission';

const Home = props => (
  <div className="App">
    <header className="App-header">
      <h1 className="App-title">Meme Bot</h1>
    </header>
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

const mapStateToProps = state => ({
  inputValue: state.jobSubmission.jobInput,
  error: state.jobSubmission.submissionError,
  shouldShowLoading:
    state.jobSubmission.submissionInProgress ||
    (state.jobSubmission.submissionSuccess && !state.jobSubmission.jobUrl) ||
    state.jobSubmission.pollingForJobCompletion,
  videoUrl: state.jobSubmission.jobUrl
});

const mapDispatchToProps = dispatch => {
  return {
    handleInputChange: input => dispatch(updateJobInput(input)),
    enqueueJob: message => {
      dispatch(enqueueJob(message)).then(
        id => dispatch(pollForJobCompletion(id)),
        err => console.error('An error occurred submitting the job')
      );
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
