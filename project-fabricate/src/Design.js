import React from "react";
import './Design.css';
import { Button } from '@material-ui/core'

// import * as tf from '@tensorflow/tfjs';

function Design (props) {
    

const onDownload = () => {
    const link = document.createElement("a");
    var my_img = document.getElementById("final")
    link.download = `download.png`;
    link.href = my_img.src;
    link.click();
  };
    return (
        <div>
            <h2> Design Generator</h2>
            <div className="BoundingBox">
                {props.m_file ? <img id="final" width="400" height="400" src={props.m_file} alt=""/> : null}
            </div>
            <div className="btn">
            <Button onClick={onDownload} variant="contained" >
                Download
            </Button>
            </div>
        </div>

    );
    
}

export default Design;