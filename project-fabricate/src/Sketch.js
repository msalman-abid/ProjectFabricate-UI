import React, { Component } from "react";
import { Button } from '@material-ui/core'
import './Sketch.css';
import * as tf from '@tensorflow/tfjs';
import { border, height, width } from "@mui/system";
import { tensor3d } from "@tensorflow/tfjs";
import { red } from 'material-ui/colors';



class Sketch extends Component {

    constructor(props){
        super(props)
        this.state = {
          file: null,
          finalimg: null,
        }
        this.handleChange = this.handleChange.bind(this)
      }



      async loadModel(tensor)
      {

        tf.enableDebugMode()
        var model = await tf.loadLayersModel(process.env.PUBLIC_URL + 'model_converted/model.json')
        return model.predict(tensor);
        // return model
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
        
        var formdata = new FormData();
        formdata.append('image',blob);

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


      modelPredict() {

        // Create image object to hold data
        var m_img = new Image(256,256);
        m_img.src = this.state.file;
        
        console.log(tf.ENV.features)
        m_img.onload = () => {

            // Capture uploaded image and convert to tensor
            var tensor = tf.browser.fromPixels(m_img).resizeBilinear([256, 256]);
            
            // tf.browser.toPixels(tensor, document.getElementById("final"));
            
            // Normalize the image from [0, 255] to [-1, 1].
            const offset = tf.scalar(127.5);
            const normalized = tensor.sub(offset).div(offset);

            // Add extra dim for batch predict support
            tensor = tf.expandDims(normalized);
            tensor.data().then(data => console.log(data));
            
            // Load model and return prediction
            this.loadModel(tensor).then( (result) => {

              // console.log(result.summary());
              // return;
              result.data().then(data => console.log(data));
              
              var new_tensor = result.squeeze();
              new_tensor = new_tensor.toInt();
              new_tensor.data().then(data => console.log(data));
              
              tf.browser.toPixels(new_tensor, document.getElementById("final"));
              console.log("Done");
            }
            )
        }

      }

      

      render() {
        return (
          <div>
            <h2> Augmented Sketch</h2>
             <div className="Image">
              <img id="upload" width='400' height='400' src={this.state.file} />
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
            </div>


          </div>

        );
    }
}

export default Sketch;