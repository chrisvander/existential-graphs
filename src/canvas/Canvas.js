import React from 'react';
import { convertToArray } from '../converters';
import Toolbox from './Toolbox';
import StepMenu from './StepMenu';
import EGVariable from './EGVariable';
import EGCut from './EGCut';
import './Canvas.scss';
import Panzoom from 'panzoom';
import config from './config';
const nanoid = require('nanoid').nanoid;

// some defaults: 
//    <text> blocks are automatically 22px high

const TEXT_H = 22;

function initXY(step, level, tdata = {}) {
  let data = tdata
  let currentX = 0
  let currentY = 0
  let maxX = 0
  let maxY = 0


  // gapSize should be equal to the number of level changes
  // in between two variables, so that we can evenly place 
  // them initially across the screen
  function initXYRecurse(step, level, gapSize) {
    console.log(data)
    for (let s in step) {
      if (step[s] instanceof Array && step[s].length > 0) {
        let id = nanoid()
        step[s] = { data: initXYRecurse(step[s], level + 1), type: "cut", id: id }
        data[id] = { type: "cut" }
      } else {
        let X = currentX;
        let Y = currentY;
        let id = nanoid()
        data[id] = { 
          type: "var",
          var: step[s], 
          x: Math.round(X/config.gridSize)*config.gridSize, 
          y: Math.round(Y/config.gridSize)*config.gridSize,
        }
        step[s] = id
        maxY = Y > maxY ? Y : maxY;
        maxX = X > maxX ? X : maxX;
        currentX += config.initialSeparation
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
      functions: {
        insert: () => {
          console.log("INSERTION")
        },
        erase: () => {
          console.log("ERASURE")
        },
        iterate: () => {
          console.log("ITERATION")
        },
        dc: () => {
          console.log("DOUBLE CUT")

          let { steps, currentStep } = this.state;
          let { premises, conclusion } = this.state.proof;
          let { stepZero, data } = initXY(convertToArray(premises.join('')), 0, this.state.data);
          steps.push(stepZero);
          currentStep+=1;
          this.setState({ steps: steps, currentStep: currentStep, data:data });

          //console.log(premises)
          //console.log(convertToArray(premises.join('')))
          //console.log([[ ["P",["Q"]] , [["P"],"Q"] ]])
          //console.log(initXY(convertToArray(premises.join(''))[0]), 0)
          //let { stepZero, data } = initXY([ ["P",["Q"]] , [["P"],"Q"] ], 0);
          //steps.push(stepZero);
          //  this.setState({ steps: steps, currentStep: 1, data: data });
        }
      }
    };
  }

  addElement() {

  }

  changePos(id, x, y) {
    let { data } = this.state;
    Object.assign(data[id], { x: x, y: y })
    this.setState(data)
  }

  renderStep(stepIndex) {
    let step = this.state.steps[stepIndex]
    if (step) {
      const setXY = (id,x,y) => {
        let { data } = this.state;
        data[id].x = x;
        data[id].y = y;
        this.setState({ data: data })
      }

      const renderRecurse = (step) => {
        let jsx = [];
        for (let s in step) {
          if (step[s].type === "cut") {
            let groupElement = <EGCut>{renderRecurse(step[s].data)}</EGCut>;
            jsx.push(groupElement);
          } else {
            let el = this.state.data[step[s]]
            console.log("ELEMENT")
            console.log(el)
            jsx.unshift(
              <EGVariable 
                x={el.x} 
                y={el.y} 
                id={step[s]} 
                panzoom={this.panzoom}
                getCoords={this.getSVGCoords}
                setCoords={(x,y) => setXY(step[s],x,y)}
                key={step[s]}>
                {el.var}
              </EGVariable>
            );
          }
        }
        return jsx;
      }
      renderRecurse.bind(this);
      return renderRecurse(step.data)
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
      this.setState({ steps: steps, currentStep: 0, data: data });
    }
    let step = this.state.steps[this.state.currentStep];

    this.panzoom.moveTo(vw/2 - step.w, vh/2 - step.h);
    this.panzoom.zoomTo(vw/2 - step.w, vh/2 - step.h, 2);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this);
  }

  getSVGCoords(domX, domY) {
    var pt = this.canvasContainer.current.createSVGPoint();

    pt.x = domX;
    pt.y = domY;

    return pt.matrixTransform(this.canvas.current.getScreenCTM().inverse());
  }

  render() {
    console.log(this.state)
    let zoomWithWheel = () => {}
    if (this.panzoom)
      zoomWithWheel = this.panzoom.zoomWithWheel
    return (
      <div>
        <Toolbox 
          functions={this.state.functions}
        />
        <svg 
          ref={this.canvasContainer}
          className="canvas noselect" 
          onWheel={zoomWithWheel} >
          <g ref={this.canvas}>
            {this.renderStep(this.state.currentStep)}
          </g>
        </svg>
        <StepMenu 
          currentStep={this.state.currentStep} 
          stepInfo={this.state.steps} 
          setStep={s => this.setState({ currentStep: s })}
        />
      </div>
    );
  }
}

export default Canvas;
