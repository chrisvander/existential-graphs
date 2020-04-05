import React from 'react';
import InfiniteCanvas from 'infinite-canvas';
import { Stage, Shape, Ticker, Bitmap, Text } from "@createjs/easeljs";

class Canvas extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props.proof)

    this.canvas = React.createRef();
    this.deviceScale = window.devicePixelRatio
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

  resize(canvas) {
    let ctx = canvas.getContext('2d');
    let scale = this.deviceScale;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(scale, scale);
    return canvas;
  }

  componentDidMount() {
    // initialize stage
    this.stage = new Stage(this.canvas.current);
    window.addEventListener('resize', () => {
      this.canvas.current = this.resize(this.canvas.current);
    });
    Ticker.addEventListener("tick", (event) => {
      this.stage.update();
    });
    this.resize(this.canvas.current);

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
      <canvas 
        onDrop={this.onDrop}
        onDragOver={(e)=>e.preventDefault()}
        ref={this.canvas} />
    );
  }
}

export default Canvas;
