import logo from './flower.png';
// import arrow from './arrow.png';
import './App.css';
import Canvas from './Canvas';
import Sketch from './Sketch';
import Design from './Design'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
         PROJECT FABRICATE
        </p>
      </header>
      <div className='Components'>
        <Canvas />
        <ArrowForwardIosIcon fontSize="large" style = {{color:'#ffd400'}}/>
        <Sketch/>
        <ArrowForwardIosIcon fontSize="large" style = {{color:'#ffd400'}}/>
        <Design/>
      </div>
    </div>
  );
}

export default App;
