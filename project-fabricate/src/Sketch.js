import React, { Component } from "react";
import { Button } from '@material-ui/core'
import './Sketch.css';
import * as tf from '@tensorflow/tfjs';


// const model = async () => {
//   const x = await tf.loadLayersModel(process.env.PUBLIC_URL + 'model_converted/model.json');
//   return x;
// }

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
        // this.setState({
        //   model: tf.loadLayersModel(process.env.PUBLIC_URL + 'model_converted/model.json')
        // }).then( (res) => {
        //   console.log(this.state.model)
        //   console.log("Completed :)")
        // }
          
        // )
        var model = await tf.loadLayersModel(process.env.PUBLIC_URL + 'model_converted/model.json')
        console.log(model.predict(tensor))
        return model;
      }

      handleChange(elem) {
        
        this.setState({
          // file: reader.readAsDataURL(file)
          file: URL.createObjectURL(elem.target.files[0]),
        })
        // this.props.pCallback(URL.createObjectURL(elem.target.files[0]));
        console.log(this.state.file);
        var y = document.getElementById("upload");
        console.log(y);
        var tensor = tf.browser.fromPixels(y);
        console.log(tensor);
        var model  = this.loadModel(tensor);
        // model.then( (res) => {
        //   var hello = model.predict(tensor);
        //   console.log(hello);
        // }
        // )


      }


      

      render() {
        return (
          <div>
            <h2> Augmented Sketch</h2>
            <div className="Image">
              <img id="upload" width='400' height='400' src={this.state.file} />
            </div>
            <input type="file" onChange={this.handleChange} />



            <h2> Design Generator</h2>
            <div className="BoundingBox">
              <img id="final" width="400" height="400" src={this.state.finalimg} />
            </div>
          </div>

        );
    }
}

export default Sketch;