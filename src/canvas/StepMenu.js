import React from 'react';
import { ReactSVG } from 'react-svg';

class StepMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {  
  }

  render() {
    return (
      <React.Fragment>
        <div className="step-menu">
          <ReactSVG src="/assets/step-first.svg" />
          <ReactSVG src="/assets/step-prev.svg" />
          <ReactSVG src="/assets/step-next.svg" />
          <ReactSVG src="/assets/step-last.svg" />
        </div>
        <div className="step-text">
          Step {this.props.currentStep} of {this.props.stepInfo.length}
        </div>
      </React.Fragment>
    );
  }
}

export default StepMenu;