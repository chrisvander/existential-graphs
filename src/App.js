import React from 'react';
import './App.scss';
import Sidebar from './sidebar/Sidebar';
import Canvas from './Canvas';
import Popup from './Popup';
import CreateNew from './CreateNew';
import IntroWindow from './intro/IntroWindow';

class App extends React.Component {
  constructor(props) {
    super(props);
  
    this.createNewProof = this.createNewProof.bind(this);
    this.state = {
      canvasOpen: false,
      popupOpen: false,
      proof: {
        premises: {

        },
        conclusion: {

        },
        steps: {

        }
      }
    };
  }

  createNewProof() {
    this.setState({ popupOpen: true })
  }

  render() {
    if (this.state.canvasOpen) {
      return (
        <div className="App">
          <Canvas proof={this.state.proof} />
          <Sidebar />
        </div>
      );
    }
    // return (
    //   <div className="initial">
    //     <h1>Existential Graphs</h1>
    //     <p>Using this tool, you can initialize proofs
    //     in the existential graph schema and then you 
    //     can go through the process of solving them. You
    //     can save these proofs and look back at them later.</p>
    //     <br />
    //     <button className="button" onClick={() => this.createNewProof()}>
    //       New
    //     </button>
    //     <button className="button">
    //       Open
    //     </button>
    //     <Popup title="Create New Proof" onClose={() => this.setState({ popupOpen: false })}>
    //       <CreateNew />
    //     </Popup>
    //   </div>
    // );
    return (<div className="initial"><IntroWindow /></div>);
  }
}

export default App;
