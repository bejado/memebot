import React from 'react';
import { Route } from 'react-router-dom';
import JobSubmission from './JobSubmission';

const App = () => (
  <div>
    <main>
      <Route exact path="/" component={JobSubmission} />
    </main>
  </div>
);

export default App;
