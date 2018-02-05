import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom'
import './App.css';
import Home from './Home'

const App = () => (
  <div>
    <main>
      <Route exact path="/" component={Home} />
    </main>
  </div>
)

export default App;
