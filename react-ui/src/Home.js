import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { updateJobInput, enqueueJob, pollForJobCompletion } from './modules/jobs'

const Home = props => (
  <div className="App">
    <header className="App-header">
      <h1 className="App-title">Meme Bot</h1>
    </header>
    <p className="App-intro">
      Input a YouTube video URL:
    </p>
    <input type="text" value={props.inputValue} onChange={(e) => props.handleInputChange(e.target.value)} />
    <button onClick={() => props.enqueueJob(props.inputValue)}>Go!</button>
    { props.videoUrl ?
        <video src={props.videoUrl} controls autoPlay /> :
        undefined }
  </div>
)

const mapStateToProps = state => ({
  inputValue: state.jobs.jobInput,
  videoUrl: state.jobs.jobUrl
})

const mapDispatchToProps = dispatch => {
  return {
    handleInputChange: (input) => dispatch(updateJobInput(input)),
    enqueueJob: (message) => {
      dispatch(enqueueJob(message))
        .then((id) => dispatch(pollForJobCompletion(id)))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
