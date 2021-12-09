import React, { Component } from "react";
import { Button } from '@material-ui/core'
import './Canvas.css';
import CanvasDraw from "react-canvas-draw";

class Canvas extends Component {
    
    state = {
        color: "black",
        width: 400,
        height: 400,
        brushRadius: 10,
        lazyRadius: 12,
      };

    render() {
        return (
            <div>
            <Button
            onClick={() => {
              localStorage.setItem(
                "savedDrawing",
                this.saveableCanvas.getSaveData()
              );
            }}
          >
            Save
          </Button>
          <Button
            onClick={() => {
              this.saveableCanvas.eraseAll();
            }}
          >
            Erase
          </Button>
          <Button
            onClick={() => {
              this.saveableCanvas.undo();
            }}
          >
            Undo
          </Button>
          <Button
            onClick={() => {
              console.log(this.saveableCanvas.getDataURL());
              alert("DataURL written to console")
            }}
          >
            GetDataURL
          </Button>
          <div>
            <label>Width:</label>
            <input
              type="number"
              value={this.state.width}
              onChange={e =>
                this.setState({ width: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <label>Height:</label>
            <input
              type="number"
              value={this.state.height}
              onChange={e =>
                this.setState({ height: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <label>Brush-Radius:</label>
            <input
              type="number"
              value={this.state.brushRadius}
              onChange={e =>
                this.setState({ brushRadius: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <label>Lazy-Radius:</label>
            <input
              type="number"
              value={this.state.lazyRadius}
              onChange={e =>
                this.setState({ lazyRadius: parseInt(e.target.value, 10) })
              }
            />
          </div>
        <CanvasDraw className='Canvas'
          ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
          brushColor={this.state.color}
          brushRadius={this.state.brushRadius}
          lazyRadius={this.state.lazyRadius}
          canvasWidth={this.state.width}
          canvasHeight={this.state.height}
        />
        </div>
        )
    }
}

export default Canvas;