import React from 'react';
import { ReactSVG } from 'react-svg';

// TODO: 
//   Align the buttons vertically center
//   Gray out the back buttons if currentStep == 0
//   Gray out the next buttons if currentStep == stepInfo.length
//   Call this.props.setStep(step) to change

class StepMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backColor:"rgb(68, 68, 68)",
      nextColor:"rgb(68, 68, 68)"
    };
    if(this.props.currentStep == 1){
      this.state.backColor = "rgb(136, 136, 136)";
    }
  }

  componentDidMount() {  
  }

  render() {
    return (
      <React.Fragment>
        <div className="step-menu" style={{color:this.state.backColor}}>
          <ReactSVG src="/assets/step-first.svg"/>
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