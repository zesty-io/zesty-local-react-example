import React, { Component } from 'react';

var Main = createReactClass({
  render: function() {
  	console.log(this.props)
    return (
      <div>
        <Header activePage={this.props.activePage}/>
        {this.props.activePage === "home" ? (<Home/>) : (<Menu/>)}
      </div>
    );
  }
});
