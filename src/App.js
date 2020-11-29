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
    this.setStyle = this.setStyle.bind(this);
    this.introWindow = React.createRef();
    this.state = {
      initialCSS: 'initial',
      canvasOpen: false,
      popupOpen: false,
      fitchStyle: localStorage.getItem('fitchStyle') === 'true',
      filename: '',
      proof: {
        premises: [],
        conclusion: '',
        steps: []
      },
      recentDocs: this.getRecents()
    };
    
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

  setStyle(bool) {
    localStorage.setItem('fitchStyle', bool);
    this.setState({ fitchStyle: bool });
  }

  render() {
    if (this.state.canvasOpen) {
      return (
        <div className="App">
          <Canvas 
            menuItems={this.menuItems}
            fitchStyle={this.state.fitchStyle}
            setStyle={this.setStyle}
            saveProof={this.saveProof(this.state.filename)} 
            proof={this.state.proof} />
        </div>
      );
    }
    let { recentDocs } = this.state;
    let keys = Object.keys(recentDocs)
    for (let i in keys) {
      recentDocs[keys[i]].open = () => {
        this.setState({ 
          filename: keys[i],
          proof: recentDocs[keys[i]] 
        });
        this.openCanvas();
      }
      recentDocs[keys[i]].delete = () => {
        let rArray = localStorage.getItem('recentDocs');
        rArray = rArray ? JSON.parse(rArray) : {}
        delete rArray[keys[i]];
        localStorage.setItem('recentDocs', JSON.stringify(rArray));
        this.setState({ recentDocs: rArray });
      }
    }
    return (
      <div className={this.state.initialCSS}>
        <IntroWindow 
          ref={this.introWindow} 
          recentDocs={this.state.recentDocs}
          setupFunc={this.setupProof}
          setStyle={this.setStyle}
          proofStyle={this.state.fitchStyle} />
      </div>
    );
  }
}

export default App;
