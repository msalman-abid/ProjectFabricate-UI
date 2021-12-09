import logo from './flower.png';
// import logo from './logo.svg';
import './App.css';
import Canvas from './Canvas';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
         Project Fabricate
        </p>
      </header>
        
        <Canvas />
    
    </div>
  );
}

export default App;
