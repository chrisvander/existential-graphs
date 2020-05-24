import React from 'react';
import { ReactSVG } from 'react-svg';

class StepMenu extends React.Component {
  constructor(props) {
    super(props);
  
    this.performRedo = this.performRedo.bind(this);
    this.performUndo = this.performUndo.bind(this);
    this.state = {};
  }
  handleClick(event, step, disabled) {
    event.preventDefault();
    if (!disabled) {
      // Must update color before updating props to allow component to
      // render with the proper current color rather than the state before
      this.props.setStep(step);
    }
  }

  performUndo(evt) {
    let { changeHistory, steps, redoHistory } = this.props.state;
    let prev = changeHistory.pop();

    if (prev) {
      redoHistory.push(steps);
      this.props.setState(changeHistory, prev.steps, redoHistory);
    }
  }

  performRedo(evt) {
    let { changeHistory, steps, redoHistory } = this.props.state;
    let prevSteps = redoHistory.pop();

    if (prevSteps) {
      changeHistory.push({ redoHistory, steps });
      this.props.setState(changeHistory, prevSteps, redoHistory);
    }
  }

  getColor(disabled) {
    return disabled ? "rgb(136, 136, 136)" : "rgb(68, 68, 68)";
  }

  disable(st, obj) {
    return st.concat(obj.length > 0 ? "" : " disabled")
  }

  render() {
    let { hide, currentStep, stepInfo, state } = this.props;
    let { changeHistory, redoHistory } = state;
    if (hide) return (<React.Fragment />);
    let backEnabled = currentStep === (stepInfo.length - 1);
    let forwardEnabled = currentStep === 0;
    return (
      <React.Fragment>
        <div className="step-menu">
        <div style={{ color: this.getColor(forwardEnabled)}}>
          <div onClick={(event) => this.handleClick(event, 0, forwardEnabled)}>
            <ReactSVG src={process.env.PUBLIC_URL + "/assets/step-first.svg"}/>
          </div>
          <div onClick={(event) => this.handleClick(event, currentStep - 1, forwardEnabled)}>
            <ReactSVG src={process.env.PUBLIC_URL + "/assets/step-prev.svg"} />
          </div>
        </div>
        <div>
          <div className={this.disable("undo-btn", changeHistory)} onClick={this.performUndo}>
            <div className="undo-svg">
              <ReactSVG src={process.env.PUBLIC_URL + "/assets/undo.svg"} />
            </div>
          </div>
          <div className={this.disable("redo-btn", redoHistory)} onClick={this.performRedo}>
            <div className="redo-svg">
              <ReactSVG src={process.env.PUBLIC_URL + "/assets/redo.svg"} />
            </div>
          </div>
          
        </div>
        <div style={{ color: this.getColor(backEnabled)  }}>
          <div onClick={(event) => this.handleClick(event, currentStep + 1, backEnabled)}>
            <ReactSVG src={process.env.PUBLIC_URL + "/assets/step-next.svg"} />
          </div>
          <div onClick={(event) => this.handleClick(event, stepInfo.length - 1, backEnabled)}>
            <ReactSVG src={process.env.PUBLIC_URL + "/assets/step-last.svg"} />
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