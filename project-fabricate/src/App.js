import logo from './flower.png';
import tiledimg from './tiledimg.png'
import React, { Component } from "react";
import './App.css';
import DrawCanvas from './DrawCanvas'; 
import Sketch from './Sketch';
import Design from './Design'
import Autoenc from './Autoenc'
import { Button, Slider, Box } from '@material-ui/core'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const marks = [
  {
    value: 0,
    label: 'Original',
  },
  {
    value: 10,
    label: '10x10',
  },
];

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      a_file: null,
      p_file: null,
      tiled: null,
    }
  }

  callbackFunction = (childData) => {
    this.setState({p_file: childData});
  }
  
  callbackAugment = (data) =>{
    this.setState({a_file: data})
  }
  onClick = () => {
    this.setState({
      tiled: tiledimg
    })

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

          {/* <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} /> */}
          
          {/* <Autoenc m_design={this.state.p_file}/> */}
        </div>

        <div className = 'Row'>
          <Box sx={{width: '50%'}}>
          <Slider 
                defaultValue={2}
                // getAriaValueText={valuetext}
                step={1}
                valueLabelDisplay="auto"
                marks={marks}
                max={10}
                // size='large'
                color='secondary'
                sx={{width: 20}}
              />
          </Box>
          <div className="button">
          <Button style = {{color:'#282c34'}} variant='contained' size='large' onClick={this.onClick}> Show Tile</Button>
          </div>
        </div>
        <img className='tiled' src={this.state.tiled} ></img>

      </div>
    );
  }
}

export default App;
