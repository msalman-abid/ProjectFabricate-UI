import logo from './flower.png';
// import arrow from './arrow.png';
import React, { Component } from "react";
import './App.css';
import DrawCanvas from './DrawCanvas'; 
import Sketch from './Sketch';
import Design from './Design'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      p_file: '1'
    }
  }

  callbackFunction = (childData) => {
    this.setState({p_file: childData});
    console.log(this.state.p_file);
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            PROJECT FABRICATE
          </p>
        </header>
        <div className='Components'>
          <DrawCanvas />
          <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />

          <Sketch pCallback = {this.callbackFunction} />
          <p> {this.state.p_file}</p>
          <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />

          {/* <Design m_file={this.state.p_file}/> */}
        </div>
      </div>
    );
  }
}

export default App;
