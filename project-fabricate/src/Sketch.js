import React, { Component } from "react";
import { Button, Drawer, CircularProgress, Checkbox, Box } from '@material-ui/core'
import './Sketch.css';
import "react-sliding-pane/dist/react-sliding-pane.css";


class Sketch extends Component {

    constructor(props){
        super(props)
        this.state = {
          file: this.props.m_file,
          finalimg: null,
          isPaneOpen: false,
          imgArray: new Array(10).fill(null),
          total: 0,
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
          var total = parseInt(result['total']);
          let tempArray = new Array(10);
          for(var i=0; i< total; i++){
            let keyString = "result" + i.toString();
            var bytestring = result[keyString];
            let tmp_img = bytestring.split('\'')[1];
            tempArray[i] = 'data:image/jpeg;base64,' + tmp_img;
          }
          this.setState({imgArray : tempArray, total: total});

        })
      }

      handleRecommendation(){
        this.setState({isPaneOpen: false});

        let chkd_array = Array(this.state.total).fill(0);
        
        for (let index = 0; index < this.state.total; index++) {
          const str_id = index.toString();
          const checkbox = document.getElementById(str_id);
          if(checkbox.checked)
            chkd_array[index] = 1;
        }
        
        this.props.setLoading(true);

        let formdata = new FormData();
        formdata.append('chkd_array',chkd_array);
        fetch('/api/augment_recomm', {
          method: 'POST',
          body: formdata
        }).then(data => data.json())
          .then(result => {
            var bytestring = result['status'];
            var image = bytestring.split('\'')[1];
            this.setState({
              file: 'data:image/jpeg;base64,'+image,
            },
            () => {
              this.props.revertToRecommended(this.state.file);
              fetch(this.state.file)
              .then(res => res.blob())
              .then(blob => {
                this.backendPredict(blob);
              })  
            })
          })
      }

      render() {
        return (
          <div>
            <h2> Augmented Sketch</h2>
             <div className="Image">
               <Box
               display="flex"
               flexDirection="column"
               justifyContent="center"
               alignItems="center"
              sx={{
                width: 400,
                height: 400,
                }}>
              {this.props.loading ? <CircularProgress size={100}/> : 
              <img id="upload" width='400' height='400' 
                src={this.props.m_file == null ? this.state.file : this.props.m_file}/>}
               {/* {this.props.loading ? "\nGenerating..." : null} */}
               </Box>
               
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
              <div className="btn">
              <Button style={{ background: '#ffd400' }} variant='contained' size='large'
                onClick={() => this.setState({ isPaneOpen: true }, this.getRecommendedSketches())}>
                View Recommendations
              </Button>
              </div>
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


              <h3 >Recommended Objects</h3>

              <div className="imgs-div">
              <div className='submit_btn'>
              <Button style = {{background:'#ffd400'}} variant='contained' size='medium' 
              onClick={() => this.handleRecommendation()}>
              Submit 
            </Button>
            </div>

                <div className="elements">
                  <img src={this.state.imgArray[0]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="0" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[1]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="1" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[2]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="2" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[3]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="3" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[4]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="4" />
                </div>
 
                <div className="elements">
                  <img src={this.state.imgArray[0]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="5" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[1]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="6" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[2]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="7" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[3]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="8" />
                </div>

                <div className="elements">
                  <img src={this.state.imgArray[4]} height={200} width={200} alt="Sorry :("/>
                  <Checkbox id="9" />
                </div>
              </div>
            </Drawer>

          </div>

        );
    }
}

export default Sketch;


