import React, { Component } from 'react';

export default class Header extends Component {
  render() {
    return (
      <div>
        <nav
          className="navbar navbar-expand-lg navbar-dark site_navbar bg-dark site-navbar-light"
          id="site-navbar"
        >
          <div className="container">
            <a className="navbar-brand" href="/">
              Zesty Burger
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#site-nav"
              aria-controls="site-nav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="oi oi-menu" /> Menu
            </button>

            <div className="collapse navbar-collapse" id="site-nav">
              <ul className="navbar-nav ml-auto">
                <li className={`nav-item ${
                    this.props.activePage === 'home' ? "active" : ""
                  }`}>
                  <a href="/" className="nav-link">
                    Home
                  </a>
                </li>
                <li className={`nav-item ${
                    this.props.activePage === 'menu' ? "active" : ""
                  }`}>
                  <a href="/menu" className="nav-link">
                    Menu
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
