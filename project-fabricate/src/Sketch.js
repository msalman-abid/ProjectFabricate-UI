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
          imgArray: new Array(10).fill(null),
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
        }).then(data => data.json()
        ).then(result =>{
          var total = parseInt(result['total'])
          for(var i=0; i< total; i++){
            let tempArray = this.state.imgArray.slice()
            let keyString = 'result'.concat(toString(i))
            tempArray[i] = result[keyString]
              this.setState({
                imgArray : tempArray              
              })
          }
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
                  <img src={this.state.imgArray[0]} height={200} width={200} />
                  <Checkbox id="0" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[1]} height={200} width={200} />
                  <Checkbox id="1" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[2]} height={200} width={200} />
                  <Checkbox id="2" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[3]} height={200} width={200} />
                  <Checkbox id="3" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[4]} height={200} width={200} />
                  <Checkbox id="4" />
                </div>
              </div>

            </Drawer>

          </div>

        );
    }
}

export default Sketch;


