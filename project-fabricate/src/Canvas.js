import React, { Component } from "react";
import { Button } from '@material-ui/core'
import './Canvas.css';
import CanvasDraw from "react-canvas-draw";


class Canvas extends Component {
    
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

          <Button style = {{color:'#282c34'}} variant='outlined' size='large'
            onClick={() => {
              this.saveableCanvas.eraseAll();
            }}
          >
            Erase
          </Button>

          <div className="undo">
          <Button style = {{color:'#282c34'}} variant='outlined' size='large'
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
            }}
          >
            Submit
          </Button>


          </div>
        </div>
        )
    }
}

export default Canvas;