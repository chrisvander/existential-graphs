import React from 'react';

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
          test
        </div>
        <div className="step-text">
          Step {this.props.currentStep} of {this.props.stepInfo.length}
        </div>
      </React.Fragment>
    );
  }
}

export default StepMenu;