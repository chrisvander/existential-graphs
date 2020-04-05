import React from 'react';

class Canvas extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props.proof)

    let { premises, conclusion, steps } = this.props.proof;
    this.state = {
      proof: {
        premises: premises,
        conclusion: conclusion
      },
      steps: steps,
      currentStep: 1,
    };
  }

  componentDidMount() {
    
    // if there are no existing steps, init first step
    let { steps } = this.state;
    if (steps.length === 0) {
      let { premises, conclusion } = this.state;
      this.setState({ currentStep: 1 });
      console.log("INITIALIZING")
      console.log(premises)
    }
    console.log(this.state)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this);
  }

  render() {
    return (
      <canvas ref={this.canvas} />
    );
  }
}

export default Canvas;
