import React, { Component } from "react";
import { Button } from '@material-ui/core'
import './DrawCanvas.css';
import CanvasDraw from "react-canvas-draw";


class DrawCanvas extends Component {
    
    state = {
        color: "black",
        width: 400,
        height: 400,
        brushRadius: 1,
        lazyRadius: 1,
        hideGrid: true,
      };

    render() {
        return (
          <div>
          <h2> Drawing Canvas</h2>
          <CanvasDraw className='Canvas'
          ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
          brushColor={this.state.color}
          brushRadius={this.state.brushRadius}
          lazyRadius={this.state.lazyRadius}
          canvasWidth={this.state.width}
          canvasHeight={this.state.height}
          hideGrid={this.state.hideGrid}
        />

        <div className = "buttons" style={{ display: "flex" }}>

          <Button style = {{color:'#282c34'}} variant='contained' size='large'
            onClick={() => {
              this.saveableCanvas.eraseAll();
            }}
          >
            Erase
          </Button>

          <div className="undo">
          <Button style = {{color:'#282c34'}} variant='contained' size='large'
            onClick={() => {
              this.saveableCanvas.undo();
            }}
          >
            Undo
          </Button>

          </div>

          <Button style = {{background:'#ffd400'}} variant='contained' size='large' 
            onClick={() => {
              localStorage.setItem(
                "savedDrawing",
                this.saveableCanvas.getSaveData()
              );

              fetch(this.saveableCanvas.getDataURL())
                .then(res => res.blob())
                .then(blob => {

                  const file = new File([blob], "image.png");
                  var formdata = new FormData();
                  formdata.append('image', file);

                  console.log(formdata);

                  fetch('/api/augment', {
                    method: 'POST',
                    body: formdata,
                  })
                })


              
              // fetch request to /api/augment and send the sketchData
              
              // .then(
              //   data => data.json()
              // ).then(
              //   result => {
              //     var bytestring = result['status'];
					    //     var image = bytestring.split('\'')[1];
              //     this.props.aCallback('data:image/jpeg;base64,'+image);
              //   }
              // )

            }}
          >
            Submit
          </Button>


          </div>
        </div>
        )
    }
}

export default DrawCanvas;