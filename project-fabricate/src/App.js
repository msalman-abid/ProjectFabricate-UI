import logo from './flower.png';
import React, { Component } from "react";
import './App.css';
import DrawCanvas from './DrawCanvas'; 
import Sketch from './Sketch';
import Design from './Design'
import Autoenc from './Autoenc'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      a_file: null,
      p_file: null,
    }
  }

  callbackFunction = (childData) => {
    this.setState({p_file: childData});
  }
  
  callbackAugment = (data) =>{
    this.setState({a_file: data})
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Project Fabricate
          </p>
        </header>
        <div className='Components'>
          <DrawCanvas className="canvas" aCallback = {this.callbackAugment} pCallback={this.callbackFunction}/>
          
          <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />

          <Sketch pCallback = {this.callbackFunction} m_file={this.state.a_file} />
          
          <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />

          <Design m_file={this.state.p_file}/>

          <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />
          
          <Autoenc m_design={this.state.p_file}/>
        </div>
      </div>
    );
  }
}

export default App;
