import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { updateJobInput, enqueueJob } from './modules/jobs'

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
  </div>
)

const mapStateToProps = state => ({
  inputValue: state.jobs.jobInput
})

const mapDispatchToProps = dispatch => bindActionCreators({
  handleInputChange: (input) => updateJobInput(input),
  enqueueJob: (message) => enqueueJob(message)
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
