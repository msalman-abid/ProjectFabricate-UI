import React, { Component } from "react";
import { Button, Drawer, Typography, Checkbox } from '@material-ui/core'
import './Sketch.css';
import * as tf from '@tensorflow/tfjs';
import "react-sliding-pane/dist/react-sliding-pane.css";




class Sketch extends Component {

    constructor(props){
        super(props)
        this.state = {
          file: this.props.m_file,
          finalimg: null,
          isPaneOpen: false,
        }
        this.handleChange = this.handleChange.bind(this)
      }

      handleChange(elem) {
        
        this.setState({
          file: URL.createObjectURL(elem.target.files[0]),
        }, this.backendPredict(elem.target.files[0]))

      }

      getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
      }

      backendPredict(blob) {
        
        console.log(blob);
        var formdata = new FormData();
        formdata.append('image',blob);
        console.log(formdata);

        fetch('/api/predict', {
          method: 'POST',
          body: formdata
        }).then(data => data.json())
          .then(result => {
            var bytestring = result['status'];
					  var image = bytestring.split('\'')[1];
            this.setState({
              finalimg: 'data:image/jpeg;base64,'+image,
            },
            () => {this.props.pCallback(this.state.finalimg)}
            )
          })
      }

      getRecommendedSketches(){
        fetch('/api/recomm_sketch', {
          method: 'GET',
        })
      }
      

      render() {
        return (
          <div>
            <h2> Augmented Sketch</h2>
             <div className="Image">
              <img id="upload" width='400' height='400' 
                src={this.props.m_file == null ? this.state.file : this.props.m_file}
                 />
            </div>

            <div className="btn">
              <Button
                variant="contained"
                component="label"
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={this.handleChange}
                />
              </Button>

              <Button style = {{background:'#ffd400'}} variant='contained' size='large' 
            onClick = {() => this.setState({isPaneOpen: true}, this.getRecommendedSketches())}>
              Recommended 
            </Button>
            </div>

            <Drawer
              anchor={"left"}
              open={this.state.isPaneOpen}
              onClose={
                (event) => {
                  if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
                    return;
                  }

                  this.setState({ isPaneOpen: false });
                }
              }
            >
              {/*  🐣 work on css for this */}
              <Typography variant="h6">Recommended Objects</Typography>

              <div className="imgs-div">

                <div className="elements">
                  <img src={null} height={200} width={200} />
                  <Checkbox id="0" />
                </div>

                <div className="elements">
                  <img src={null} height={200} width={200} />
                  <Checkbox id="0" />
                </div>

                <div className="elements">
                  <img src={null} height={200} width={200} />
                  <Checkbox id="0" />
                </div>

                <div className="elements">
                  <img src={null} height={200} width={200} />
                  <Checkbox id="0" />
                </div>

                <div className="elements">
                  <img src={null} height={200} width={200} />
                  <Checkbox id="0" />
                </div>
{/*                 
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} />
                  <img src={null} height={200} width={200} /> */}

              </div>

                {/* <div className="selections-div">
                  <Checkbox id="0" />
                  <Checkbox id="0" />
                  <Checkbox id="0" />
                  <Checkbox id="0" />
                </div> */}


            </Drawer>

            {/* 
            <SlidingPane
              className="some-custom-class"
              overlayClassName="some-custom-overlay-class"
              isOpen={this.state.isPaneOpen}
              title="Hey, it is optional pane title.  I can be React component too."
              // subtitle="Optional subtitle."
              from="left"
              width="25%"
              onRequestClose={() => {
                this.setState({ isPaneOpen: false });
              }}
              

              
            >
            </SlidingPane> */}

          </div>

        );
    }
}

export default Sketch;

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
  },
];
