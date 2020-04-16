import React from 'react';
import CreateNew from './CreateNew';
import { ReactSVG } from 'react-svg';
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

class IntroWindow extends React.Component {
  constructor(props) {
    super(props);
    this.createView = React.createRef();
    this.callCreate = this.callCreate.bind(this);
    this.animateAway = this.animateAway.bind(this);
    this.state = {
      createShown: false,
      floatingWindowCSS: 'floating-window shown'
    };
  }

  componentDidMount() {
  }

  animateAway() {
    this.setState({ floatingWindowCSS: 'floating-window' })
  }

  callCreate() {
    this.createView.current.create();
  }

  render() {
    const { createShown, floatingWindowCSS } = this.state;
    return (
      <div className={floatingWindowCSS}>
        {!createShown && <IntroContent />}
        {createShown && <CreateNew setupFunc={this.props.setupFunc} ref={this.createView}/>}
          {!createShown && (
            <div className="toolbar">
            <button onClick={() => this.setState({ createShown: true })}>
              New 
            </button>
            <button>
              Open 
            </button>
            </div>
          )}
          {createShown && (
            <div className="toolbar">
              <button className="back" onClick={() => this.setState({ createShown: false })}>
                <span >
                  <ReactSVG className="svg" src="/assets/back-caret.svg" />
                </span>
                Back 
              </button>
              <button onClick={this.callCreate}>
                Create 
              </button>
            </div>
          )}
      </div>
    );
  }
}

export default IntroWindow;