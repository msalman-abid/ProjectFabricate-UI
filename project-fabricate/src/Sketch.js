import React, { Component } from "react";
import { Button } from '@material-ui/core'
import './Sketch.css';

class Sketch extends Component {

    constructor(props){
        super(props)
        this.state = {
          file: null
        }
        this.handleChange = this.handleChange.bind(this)
      }
      handleChange(event) {
        this.setState({
          file: URL.createObjectURL(event.target.files[0])
        })
      }
      render() {
        return (
          <div>
            <h2> Augmented Sketch</h2>
            <div className="Image">
                <img  src={this.state.file}/>
            </div>
            <input type="file" onChange={this.handleChange}/>
            
          </div>
        );
    }
}

export default Sketch;