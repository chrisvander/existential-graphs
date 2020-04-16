import React from 'react';
import { convertToArray } from '../converters';
import Toolbox from './Toolbox';
import StepMenu from './StepMenu';
import DraggableText from './DraggableText';
import './Canvas.scss';
import Panzoom from 'panzoom';
const nanoid = require('nanoid').nanoid;

// some defaults: 
//    <text> blocks are automatically 22px high

const TEXT_H = 22;

function initXY(step, level) {
  let data = {}
  let prevLevel = 0
  let currentX = 0
  let currentY = 0
  let maxX = 0
  let maxY = 0

  function initXYRecurse(step, level) {
    for (let s in step) {
      if (step[s] instanceof Array) {
        prevLevel = level
        step[s] = initXYRecurse(step[s], level + 1)
      } else {
        let X = currentX + Math.abs(prevLevel - level) * 25;
        let Y = currentY;
        let id = nanoid()
        data[id] = { 
          var: step[s], 
          x: X, 
          y: Y 
        }
        step[s] = id
        maxY = Y > maxY ? Y : maxY;
        maxX = X > maxX ? X : maxX;
        prevLevel = level
        currentX += 50
      }
    }
    return step
  }
  return { stepZero: { data: initXYRecurse(step, level), h: maxY + TEXT_H, w: maxX }, data: data }
}

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.canvasContainer = React.createRef();

    this.renderStep = this.renderStep.bind(this);
    this.changePos = this.changePos.bind(this);
    this.getSVGCoords = this.getSVGCoords.bind(this);

    let { premises, conclusion, steps } = this.props.proof;
    this.state = {
      proof: {
        premises: premises,
        conclusion: conclusion
      },
      steps: steps,
      data: {},
      currentStep: 0,
      moveListeners: [],
    };
  }

  changePos(id, x, y) {
    let { data } = this.state;
    Object.assign(data[id], { x: x, y: y })
    this.setState(data)
  }

  renderStep(stepIndex) {
    let step = this.state.steps[stepIndex]
    if (step) {
      let svg = []

      const renderRecurse = (step) => {
        let jsx = [];
        for (let s in step) {
          if (step[s] instanceof Array) {
            jsx.push(<g>{renderRecurse(step[s])}</g>);
          } else {
            let el = this.state.data[step[s]]
            jsx.push(
              <DraggableText 
                x={el.x} 
                y={el.y} 
                id={step[s]} 
                panzoom={this.panzoom}
                getCoords={this.getSVGCoords}
                addMoveListener={this.addMoveListener.bind(this)}
                key={step[s]}>
                {el.var}
              </DraggableText>
            );
          }
        }
        return jsx;
      }
      renderRecurse.bind(this);
      svg.push(renderRecurse(step.data))
      return svg
    }
  }

  

  componentDidMount() {  
    this.panzoom = Panzoom(this.canvas.current, {
      maxZoom: 6,
      minZoom: 0.5
    });
    // this.canvasContainer.current.addEventListener('wheel', this.panzoom.zoomWithWheel);
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    // if there are no existing steps, init first step
    let { steps } = this.state;
    if (steps.length === 0) {
      let { premises, conclusion } = this.state.proof;
      let { stepZero, data } = initXY(convertToArray(premises.join('')), 0);
      steps.push(stepZero);
      console.log(data)
      this.setState({ steps: steps, currentStep: 0, data: data });
    }
    console.log(steps)
    let step = this.state.steps[this.state.currentStep];

    this.panzoom.moveTo(vw/2 - step.w, vh/2 - step.h);
    this.panzoom.zoomTo(vw/2 - step.w, vh/2 - step.h, 2);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this);
  }

  addMoveListener(callback) {
    let { moveListeners } = this.state;
    moveListeners.push(callback);
    this.setState({ moveListeners: moveListeners });
  }

  callMoveListener(evt) {
    if (this.state.moveListeners.length > 0) {
      for (let listener in this.state.moveListeners) {
        this.state.moveListeners[listener](evt)
      }
    }
  }

  getSVGCoords(domX, domY) {
    var pt = this.canvasContainer.current.createSVGPoint();

    pt.x = domX;
    pt.y = domY;

    return pt.matrixTransform(this.canvas.current.getScreenCTM().inverse());
  }

  render() {
    let zoomWithWheel = () => {}
    if (this.panzoom)
      zoomWithWheel = this.panzoom.zoomWithWheel
    return (
      <div>
        <Toolbox />
        <svg 
          ref={this.canvasContainer}
          className="canvas noselect" 
          onMouseMove={this.callMoveListener.bind(this)}
          onWheel={zoomWithWheel} >
          <g ref={this.canvas}>
            {this.renderStep(this.state.currentStep)}
          </g>
        </svg>
        <StepMenu 
          currentStep={this.state.currentStep+1} 
          stepInfo={this.state.steps} 
          setStep={s => this.setState({ currentStep: s })}
        />
      </div>
    );
  }
}

export default Canvas;
