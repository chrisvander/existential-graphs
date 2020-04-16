import React from 'react';
import { ReactSVG } from 'react-svg';

// TODO: 
//   Call this.props.setStep(step) to change

class StepMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backColor:"rgb(68, 68, 68)",
      nextColor:"rgb(68, 68, 68)"
    };
    // changes the color of the prev or next buttons to be grayed out
    // if the current step is the first or last step
    if(this.props.currentStep == 0){
      this.state.backColor = "rgb(136, 136, 136)";
    }
    if(this.props.currentStep == this.props.stepInfo.length){
      this.state.nextColor = "rgb(136, 136, 136)";
    }
  }

  componentDidMount() {  
  }

  handleClick(event, clickType){
    event.preventDefault();
    this.props.setStep(this.props.currentStep+1);
    console.log("TeStInG" + clickType);
  }

  render() {
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
          Step {this.props.currentStep} of {this.props.stepInfo.length}
        </div>
      </React.Fragment>
    );
  }
}

export default StepMenu;