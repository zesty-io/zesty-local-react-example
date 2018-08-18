import React, { Component } from 'react';
import Header from './Header.js'
import Menu from './Menu.js'
import Home from './Home.js'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    if (window.location.pathname.includes("menu")) {
      this.state = {
        activePage: "menu"
      }
    }
    else {
      this.state = {
        activePage: "home"
      }
    }
  }
  render() {
    return (
      <div>
        <Header activePage={this.state.activePage}/>
        {this.state.activePage === "home" ? (<Home/>) : (<Menu/>)}
      </div>
    );
  }
}

export default App;
