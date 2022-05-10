import logo from './flower.png';
import React, { Component } from "react";
import './App.css';
import DrawCanvas from './DrawCanvas';
import Sketch from './Sketch';
import Design from './Design'
import Autoenc from './Autoenc'
import { Button, Slider, Box, Paper } from '@material-ui/core'
import Carousel from 'react-material-ui-carousel'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { flexbox } from '@mui/system';
import {random, floor} from "mathjs";

const marks = [
  {
    value: 0,
    label: '1x1',
  },
  {
    value: 10,
    label: '10x10',
  },
];

const marks2 = [
  {
    value: 0,
    label: '0',
  },
  {
    value: 0.5,
    label: '0.5',
  },
];

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      a_file: null,
      p_file: null,
      tiled: null,
      slider_value: 2,
      slider2_value: 0.25,
      mask: null,
      mask2: null,
      cushion: null,
      slipper: null,
      scrunchie: null,
      complementary: null,
      complementary2: null,
      complementary3: null,
      complementary4: null,
      complementary5: null,
      complementary6: null,
      complementary7: null,
      mask_img: null,
      choose: 0,
    }
  }

  callbackFunction = (childData) => {
    this.setState({ p_file: childData });
  }

  callbackAugment = (data) => {
    this.setState({ a_file: data })
  }

  onClick = () => {
    
    // convert image to blob and send to server
    fetch(this.state.p_file)
      .then(res => res.blob())
      .then(blob => {
        
        var formdata = new FormData();
        formdata.append('image', blob);
        console.log(this.state.slider_value)
        formdata.append('size', this.state.slider_value);
        formdata.append('choose', this.state.choose)
        // formdata.append('retrieval', this.)
        formdata.append('overlap', this.state.slider2_value);
        fetch('/api/tiled', {
          method: 'POST',
          body: formdata
        }).then(data => data.json()) //recieve data from server
        .then(result => {
          var bytestring = result['status']; //extract from JSON
          var image = bytestring.split('\'')[1];
            var mask = result['mask'].split('\'')[1];
            var mask2 = result['mask2'].split('\'')[1];
            var cushion = result['cushion'].split('\'')[1];
            var slipper = result['slipper'].split('\'')[1];
            var scrunchie = result['scrunchie'].split('\'')[1];
            var comp = result['complementary'].split('\'')[1];
            var comp2 = result['complementary2'].split('\'')[1];
            var comp3 = result['complementary3'].split('\'')[1];
            var comp4 = result['complementary4'].split('\'')[1];
            var comp5 = result['complementary5'].split('\'')[1];
            var comp6 = result['complementary6'].split('\'')[1];
            var comp7 = result['complementary7'].split('\'')[1];
            this.setState({
              //save base64 image to state
              tiled: 'data:image/jpeg;base64,' + image,
              mask: 'data:image/jpeg;base64,' + mask,
              mask2: 'data:image/jpeg;base64,' + mask2,
              cushion: 'data:image/jpeg;base64,' + cushion,
              slipper: 'data:image/jpeg;base64,' + slipper,
              scrunchie: 'data:image/jpeg;base64,' + scrunchie,
              complementary: 'data:image/jpeg;base64,' + comp,
              complementary2: 'data:image/jpeg;base64,' + comp2,
              complementary3: 'data:image/jpeg;base64,' + comp3,
              complementary4: 'data:image/jpeg;base64,' + comp4,
              complementary5: 'data:image/jpeg;base64,' + comp5,
              complementary6: 'data:image/jpeg;base64,' + comp6,
              complementary7: 'data:image/jpeg;base64,' + comp7,

              choose: 0
            })
          })
      })

    }

  colorOnClick = () => {
    this.setState({ choose: floor(random() * 4) + 1}, 
    () => {
      this.onClick();
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
          <DrawCanvas className="canvas" aCallback={this.callbackAugment} pCallback={this.callbackFunction} />

            <div className="Arrow">
          <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />
          </div>
          <Sketch pCallback={this.callbackFunction} m_file={this.state.a_file} />
          <div className="Arrow">
          <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />
          </div>

          <Design m_file={this.state.p_file} />
          {/* <div className="Arrow"> */}
          {/* <ArrowForwardIosIcon fontSize="large" style={{ color: '#ffd400' }} />
          </div>

          {/* <Autoenc m_design={this.state.a_file}/> */}
        </div>
        
        <h1> Image Tiling</h1>
        <div className='Row'>

          <Box sx={{ width: '25%' }}>
            <h3> Control Tile Size</h3>
            <Slider
              defaultValue={2}
              // getAriaValueText={valuetext}
              step={1}
              valueLabelDisplay="auto"
              marks={marks}
              max={10}
              // size='large'
              color='secondary'
              onChange={(e, value) => this.setState(
                { slider_value: value },
                this.onClick()
                // console.log(this.state.slider_value)
                )}
                
                />
          </Box>

          <div className="button">
            <Button style={{ color: '#282c34' }} variant='contained' size='large' onClick={this.onClick}> Show Tile</Button>
          </div>
          <Box sx={{ width: '25%' }}>

            <h3> Control Overlap</h3>
            <Slider
              defaultValue={0.25}
              // getAriaValueText={valuetext}
              step={0.05}
              valueLabelDisplay="auto"
              marks={marks2}
              max={0.5}
              min={0}
              // size='large'
              color='secondary'
              onChange={(e, value) => this.setState(
                { slider2_value: value },
                this.onClick()
                // console.log(this.state.slider2_value)
              )}
            />
          </Box>
        </div>

        <div className="Row">
          <Box
            sx={{
              
              height: '100vmin',
              width: '100vmin',
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
            >
            <Paper hidden={this.state.tiled ? false : true} elevation={3}>
              <img className='tiled' src={this.state.tiled} ></img>
            </Paper>
          </Box>
        </div>
          <Button style={{ color: '#282c34' }} variant='contained' size='large' onClick={this.colorOnClick}> Change Color</Button>


        <h1>Complementary Designs</h1>
        <Carousel>
          <div>
            <img src={this.state.tiled} width='256' height='256'/>
            <img src={this.state.complementary} />
          </div>
          <div>
            <img src={this.state.tiled} width='256' height='256' />
            <img src={this.state.complementary2} />
          </div>
          <div>
            <img src={this.state.tiled} width='256' height='256' />
            <img src={this.state.complementary3} />
          </div>
          <div>
            <img src={this.state.tiled} width='256' height='256' />
            <img src={this.state.complementary4} />
          </div>
          <div>
            <img src={this.state.tiled} width='256' height='256' />
            <img src={this.state.complementary5} />
          </div>
          <div>
            <img src={this.state.tiled} width='256' height='256' />
            <img src={this.state.complementary6} />
          </div>
          <div>
            <img src={this.state.tiled} width='256' height='256' />
            <img src={this.state.complementary7} />
          </div>
            </Carousel>

        <h1> Apparel Designs</h1>
          <img  className="image" hidden={this.state.tiled ? false : true} id="mask" height="250" width="250" 
          src= {this.state.mask_img}
          onMouseOut={() => {
            this.setState({
              mask_img: this.state.mask
            })
          }}
          onMouseEnter={() => {
            this.setState({
              mask_img: this.state.mask2
            })
          }}
          >

          </img>
          <img  className="image" hidden={this.state.tiled ? false : true} id="cushion" height="300" width="300" src={this.state.cushion}></img>
          <img  className="image" hidden={this.state.tiled ? false : true} id="slipper" height="250" width="250" src={this.state.slipper}></img>
          <img  className="image" hidden={this.state.tiled ? false : true} id="scrunchie" height="250" width="250" src={this.state.scrunchie}></img>
          {/* <img id="complementary" height="250" width="250" src={this.state.complementary}></img> */}

      </div>
    );
  }
}

export default App;
