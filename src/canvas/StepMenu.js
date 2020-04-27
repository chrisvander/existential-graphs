import React from 'react';
import { ReactSVG } from 'react-svg';

class StepMenu extends React.Component {
  handleClick(event, step) {
    event.preventDefault();
    // Must update color before updating props to allow component to
    // render with the proper current color rather than the state before
    this.props.setStep(step);
  }

  render() {
    let { hide, currentStep, stepInfo } = this.props;
    if (hide) return (<React.Fragment />);
    return (
      <React.Fragment>
        <div className="step-menu">
        <div style={{ color: currentStep === 0 ? "rgb(136, 136, 136)" : "rgb(68, 68, 68)"}}>
          <div onClick={(event) => this.handleClick(event, 0)}>
            <ReactSVG src="/assets/step-first.svg"/>
          </div>
          <div onClick={(event) => this.handleClick(event, currentStep - 1)}>
            <ReactSVG src="/assets/step-prev.svg" />
          </div>
        </div>
        <div style={{ color: currentStep === (stepInfo.length - 1) ? "rgb(136, 136, 136)" : "rgb(68, 68, 68)" }}>
          <div onClick={(event) => this.handleClick(event, currentStep + 1)}>
            <ReactSVG src="/assets/step-next.svg" />
          </div>
          <div onClick={(event) => this.handleClick(event, stepInfo.length - 1)}>
            <ReactSVG src="/assets/step-last.svg" />
          </div>
        </div>
        </div>
        <div className="step-text">
          Step {currentStep + 1} of {stepInfo.length}
        </div>
      </React.Fragment>
    );
  }
}

export default StepMenu;