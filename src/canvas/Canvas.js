import React from 'react';
import { convertToArray } from '../converters';
import Toolbox from './Toolbox';
import StepMenu from './StepMenu';
import './Canvas.scss';
import Panzoom from 'panzoom';
const nanoid = require('nanoid').nanoid;

let prevLevel = 0
let currentX = 0
let currentY = 0

function initXY(step, level) {
  prevLevel = 0
  currentX = 0
  currentY = -50
  return initXYRecurse(step, level)
}

function initXYRecurse(step, level) {
  console.log(nanoid)
  for (let s in step) {
    if (step[s] instanceof Array) {
      prevLevel = level
      step[s] = initXYRecurse(step[s], level + 1)
    } else {
      step[s] = { var: step[s], id: nanoid(), x: currentX + Math.abs(prevLevel - level) * 25, y: currentY }
      prevLevel = level
      currentX += 50
    }
  }
  return step
}


class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.renderStep = this.renderStep.bind(this);
    this.renderRecurse = this.renderRecurse.bind(this);

    let { premises, conclusion, steps } = this.props.proof;
    this.state = {
      proof: {
        premises: premises,
        conclusion: conclusion
      },
      steps: steps,
      currentStep: 0,
    };
  }

  renderStep(stepIndex) {
    console.log(stepIndex)
    return this.renderRecurse(this.state.steps[stepIndex])
  }

  renderRecurse(step) {
    console.log(step)
    let jsx = [];
    for (let s in step) {
      if (step[s] instanceof Array) {
        jsx.push(this.renderRecurse(step[s]));
      } else {
        jsx.push(<text x={step[s].x} y={step[s].y} key={step[s].id}>{step[s].var}</text>);
      }
    }
    return jsx;
  }

  componentDidMount() {  
    const panzoom = Panzoom(this.canvas.current, {
      maxScale: 5,
      ignoreChildrensEvents: true,
      refreshRate: 60
    })
    // if there are no existing steps, init first step
    let { steps } = this.state;
    if (steps.length === 0) {
      let { premises, conclusion } = this.state.proof;
      this.setState({ currentStep: 0 });
      steps.push(initXY(convertToArray(premises.join('')), 0))
    }
    console.log(this.state)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this);
  }

  render() {
    return (
      <div>
        <Toolbox />
        <svg className="canvas">
          <g ref={this.canvas}>
            {this.renderStep(this.state.currentStep)}
          </g>
        </svg>
        <StepMenu currentStep={this.state.currentStep+1} stepInfo={this.state.steps} />
      </div>
    );
  }
}

export default Canvas;
