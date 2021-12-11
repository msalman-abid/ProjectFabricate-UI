import logo from './flower.png';
import arrow from './arrow.png';
import './App.css';
import Canvas from './Canvas';
import Sketch from './Sketch';
import Design from './Design'

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
        <img  className="arrow" src={arrow}/>
        <Sketch/>
        <img  className="arrow" src={arrow}/>
        <Design/>
      </div>
    </div>
  );
}

export default App;
