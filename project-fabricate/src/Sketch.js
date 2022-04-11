import React, { Component } from "react";
import { Button, Drawer } from '@material-ui/core'
import './Sketch.css';
import * as tf from '@tensorflow/tfjs';
import SlidingPane from "react-sliding-pane";
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
            var final_img = document.getElementById("final");
            this.setState({
              finalimg: 'data:image/jpeg;base64,'+image,
            },
            () => {this.props.pCallback(this.state.finalimg)}
            )
            // final_img.src = 'data:image/jpeg;base64,'+image;
            // console.log(final_img.src);
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
            
                this.setState({isPaneOpen: false});
              }
            }
          >
            {'Hello'}
  
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