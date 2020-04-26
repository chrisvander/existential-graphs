import React from 'react';
import { ReactSVG } from 'react-svg';

// TODO: 
//   Call this.props.setStep(step) to change

class StepMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backColor:"rgb(165, 165, 165)",
      nextColor:"rgb(165, 165, 165)"
    };
  }

  /* Updates the colors in the state given a step number.
   * Does not reference props so that the color can be updated
   * before the props changes and the component is rerendered
   */
  updateColor(step) {
    // changes the color of the prev or next buttons to be grayed out
    // if the current step is the first or last step
    let backColor, nextColor
    if (step === 0){
      backColor = "rgb(136, 136, 136)";
    }
    else {
      backColor = "rgb(68, 68, 68)";
    }
    if (step === (this.props.stepInfo.length - 1) || this.props.stepInfo.length === 0) {
      nextColor = "rgb(136, 136, 136)";
    }
    else {
      nextColor = "rgb(68, 68, 68)";
    }

    this.setState({ backColor: backColor, nextColor: nextColor });
  }

  componentDidMount() {
    this.updateColor(this.props.currentStep)
  }

  /* Handles clicking of the SVG components
   * event is the click itself, clicktype tells which
   * SVG button was clicked with a string
   */
  handleClick(event, clickType) {
    event.preventDefault();
    let step = this.props.currentStep;
    switch(clickType) {
      case "first":
        step = 0;
        break;
      case "prev":
        if (this.props.currentStep != 0)
          step--;
        break;
      case "next":
        if (this.props.currentStep != this.props.stepInfo.length - 1)
          step++;
          break;
      case "last":
        step = this.props.stepInfo.length - 1;
        break;
      default:
        break;
    }
    // Must update color before updating props to allow component to
    // render with the proper current color rather than the state before
    this.updateColor(step);
    this.props.setStep(step);
  }

  render() {
    if (this.props.hide) return (<React.Fragment />);
    return (
      <React.Fragment>
        <div className="step-menu">
        <div style={{color:this.state.backColor}}>
          <div onClick={(event) => this.handleClick(event, "first")}>
            <ReactSVG src="/assets/step-first.svg"/>
          </div>
          <div onClick={(event) => this.handleClick(event, "prev")}>
            <ReactSVG src="/assets/step-prev.svg" />
          </div>
        </div>
        <div style={{color:this.state.nextColor}}>
          <div onClick={(event) => this.handleClick(event, "next")}>
            <ReactSVG src="/assets/step-next.svg" />
          </div>
          <div onClick={(event) => this.handleClick(event, "last")}>
            <ReactSVG src="/assets/step-last.svg" />
          </div>
        </div>
        </div>
        <div className="step-text">
          Step {this.props.currentStep + 1} of {this.props.stepInfo.length}
        </div>
      </React.Fragment>
    );
  }
}

export default StepMenu;