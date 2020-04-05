import React from 'react';
import './App.scss';
import Canvas from './canvas/Canvas';
import IntroWindow from './intro/IntroWindow';

class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.createNewProof = this.createNewProof.bind(this);
    this.setupProof = this.setupProof.bind(this);
    this.openCanvas = this.openCanvas.bind(this);
    this.saveProof = this.saveProof.bind(this);
    this.introWindow = React.createRef();
    this.state = {
      initialCSS: 'initial',
      canvasOpen: false,
      popupOpen: false,
      proof: {
        premises: [],
        conclusion: '',
        steps: []
      }
    };
  }

  saveProof(proof) {
    this.setState({ proof: proof });
  }

  setupProof(premises, conclusion, steps) {
    this.setState({ 
      proof: { 
        premises: premises,
        conclusion: conclusion,
        steps: steps
      },
      initialCSS: 'initial whiteBG'
    });
    this.introWindow.current.animateAway();
    setTimeout(this.openCanvas, 1000);
  }

  openCanvas() {
    this.setState({ 
      canvasOpen: true
    });
  }

  createNewProof() {
    this.setState({ popupOpen: true })
  }

  render() {
    if (this.state.canvasOpen) {
      return (
        <div className="App">
          <Canvas saveProof={this.saveProof} proof={this.state.proof} />
        </div>
      );
    }
    return (
      <div className={this.state.initialCSS}>
        <IntroWindow 
          ref={this.introWindow} 
          setupFunc={this.setupProof}/>
      </div>
    );
  }
}

export default App;
