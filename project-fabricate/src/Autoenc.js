import React, { Component } from "react";
import { Button } from '@material-ui/core'
import './Autoenc.css';

class Autoenc extends Component {

    constructor(props){
        super(props)
        this.state = {
          file: this.props.m_file,
          finalimg: null,
        }
        this.handleChange = this.handleChange.bind(this)
      }
      
      handleChange(elem) {
        // TODO : handle file upload
        this.setState({
          file: URL.createObjectURL(elem.target.files[0]),
        }, this.backendAutoencoder(elem.target.files[0]))

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

      backendAutoencoder(blob) {
        
        // if (blob == null || this.props.m_design == null) {
        //   return;
        // }

        // converting image to blob to send to back-end
        fetch(this.props.m_design)
        .then(res => res.blob())
        .then(blob_struc => {

          var formdata = new FormData();
          formdata.append('image_tex',blob);
          formdata.append('image_struct',blob_struc);

          fetch('http://localhost:5000/api/auto_enc', {
            method: 'POST',
            body: formdata
          }).then(data => data.json())
            .then(result => {
              var bytestring = result['status'];
              var image = bytestring.split('\'')[1];
              this.setState({
                finalimg: 'data:image/jpeg;base64,'+image,
              }
              )
              // final_img.src = 'data:image/jpeg;base64,'+image;
              // console.log(final_img.src);
            })
      })
    }



      render() {
        return (
          <div>
            <h2> Auto Enc Sketch</h2>
             <div className="Image">
              <img id="upload" width='400' height='400' 
                alt="uploaded sketch"
                src={this.state.finalimg}
                 />
            </div>

            <div className="btn">
              <Button
                variant="contained"
                component="label"
              >
                Upload Texture
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

export default Autoenc;