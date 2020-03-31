import React from 'react';
import Fade from 'react-reveal/Fade';
import './intro.scss';

const IntroContent = () => (
  <div className="content">
    <div className="column">
      <h1>Existential Graphs</h1>
      <p>
        Using this tool, you can initialize proofs in the existential graph schema and then you can go through the process of solving them. You can save these proofs and look back at them later.
      </p>
    </div>
    <div className="divider" />
    <div className="column">
      <h1>Recent Proofs</h1>
    </div>
  </div>
);

const CreateContent = () => (
  <div className="content">
    <h1>Create New</h1>
  </div>
);

class IntroWindow extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      createShown: false
    };
  }

  componentDidMount() {
  }

  render() {
    const { createShown } = this.state;
    return (
      <div className="floating-window">
        <IntroContent />
        <CreateContent />
        <div className="toolbar">
          <button className="button" onClick={() => this.setState({ createShown: true })}>
            New 
          </button>
          <button className="button">
            Open 
          </button>
          <button className="button back" onClick={() => this.setState({ createShown: false })}>
            Back 
          </button>
          <button className="button">
            Create 
          </button>
        </div>
      </div>
    );
  }
}

export default IntroWindow;