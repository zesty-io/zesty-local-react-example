import React, { Component } from 'react';
let homepageJSON = require('./data/homepage.json')

export default class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      homeData: {}
    }
  }
  componentDidMount() {
    const loadData = () => {
      let data = JSON.parse(JSON.stringify(homepageJSON))
      this.setState({homeData: data})
    }
    loadData()
  }
  render() {
    let sectionStyle = {}
    if (this.state.homeData.data) {
      sectionStyle = {
        backgroundImage: "url(" + this.state.homeData.data.splash_background + ")"
      }
    }

    return (
      <div data-spy="scroll" data-target="#site-navbar" data-offset="200">
    
    

  <section className="site-cover" style={sectionStyle} id="section-home">
      <div className="container">
        <div className="row align-items-center justify-content-center text-center site-vh-100">
          <div className="col-md-12">
        <h1 className="site-heading no- mb-3">{this.state.homeData.data && this.state.homeData.data.splash_title}</h1>
        <h2 className="h5 site-subheading mb-5 no-">{this.state.homeData.data && this.state.homeData.data.splash_description}</h2>    
        <p><a href={this.state.homeData.data && this.state.homeData.data.splash_link} target="_blank" className="btn btn-outline-white btn-lg no-" data-toggle="modal" data-target="#reservationModal">{this.state.homeData.data && this.state.homeData.data.splash_link_text}</a></p>
          </div>
        </div>
      </div>
    </section>

</div>
    );
  }
}
