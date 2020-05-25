import React from 'react';
import './App.scss';
import Canvas from './canvas/Canvas';
import IntroWindow from './intro/IntroWindow';

var localStorage = window.localStorage;

class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.createNewProof = this.createNewProof.bind(this);
    this.setupProof = this.setupProof.bind(this);
    this.openCanvas = this.openCanvas.bind(this);
    this.saveProof = this.saveProof.bind(this);
    this.getRecents = this.getRecents.bind(this);
    this.introWindow = React.createRef();
    this.state = {
      initialCSS: 'initial',
      canvasOpen: false,
      popupOpen: false,
      filename: '',
      proof: {
        premises: [],
        conclusion: '',
        steps: []
      },
      recentDocs: this.getRecents()
    };
    
    console.log(this.state.recentDocs)
    // this.state = {
    //   initialCSS: 'initial',
    //   canvasOpen: true,
    //   popupOpen: false,
    //   proof: {premises: ["({Q})(({P}){Q})"], conclusion: "{Q}", steps:[] }
    // };

    this.menuItems = [
      { 
        title: 'Exit', 
        func: () => {
          this.setState({ 
            initialCSS: 'initial',
            canvasOpen: false,
            popupOpen: false,
            filename: '',
            proof: {
              premises: [],
              conclusion: '',
              steps: []
            },
            recentDocs: this.getRecents()
          }) 
        }
      },
      'separator',
      { 
        title: 'Export',
        func: () => {
          const element = document.createElement("a");
          const file = new Blob([JSON.stringify(this.state.proof)], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = this.state.filename + ".egprf";
          document.body.appendChild(element);
          element.click();
        } 
      }
    ]
  }

  getRecents() {
    let recents = localStorage.getItem('recentDocs');
    recents = recents ? JSON.parse(recents) : {}
    let keys = Object.keys(recents)
    for (let i in keys) {
      recents[keys[i]].open = () => {
        this.setState({ 
          filename: keys[i],
          proof: recents[keys[i]] 
        });
        this.openCanvas();
      }
    }
    return recents;
  }

  saveProof(filename) {
    let { recentDocs } = this.state;
    recentDocs[filename] = this.state.proof;
    return (proof) => {
      recentDocs[filename] = proof;
      localStorage.setItem('recentDocs', JSON.stringify(recentDocs));
    }
  }

  setupProof(filename, proof) {
    this.setState({ 
      filename: filename,
      proof: proof
    });
    this.openCanvas();
  }

  openCanvas() {
    this.setState({ initialCSS: 'initial whiteBG' });
    this.introWindow.current.animateAway();
    setTimeout(() => this.setState({ 
      canvasOpen: true
    }), 1000);
  }

  createNewProof() {
    this.setState({ popupOpen: true })
  }

  render() {
    if (this.state.canvasOpen) {
      return (
        <div className="App">
          <Canvas 
            menuItems={this.menuItems}
            saveProof={this.saveProof(this.state.filename)} 
            proof={this.state.proof} />
        </div>
      );
    }
    return (
      <div className={this.state.initialCSS}>
        <IntroWindow 
          ref={this.introWindow} 
          recentDocs={this.state.recentDocs}
          setupFunc={this.setupProof}/>
      </div>
    );
  }
}

export default App;
