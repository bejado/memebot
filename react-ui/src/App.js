import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import './App.css';
import JobSubmission from './JobSubmission';

const App = () => (
  <div>
    <main>
      <Route exact path="/" component={JobSubmission} />
    </main>
  </div>
);

export default App;
