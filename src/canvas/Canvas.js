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

function initXY(step, level) {
  let data = {}
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
        dc: (id) => {
          console.log("DOUBLE CUT")
          this.doubleCut(id);
        }
      }
    };
  }

  /* Performs a double cut given the ID of the outside cut.
  *  Will only run if the current step is the last step.
  *  Creates a deep copy of the current step, and replaces the cut with
  *  the given ID with the contents of the second cut, only if they exist.
  *  Then adds the edited copy of the current step to the end of the step array.
  */
  doubleCut(cutID) {
    let { steps, currentStep, data } = this.state;
    // only allow steps to be conducted at the end of a proof
    if (currentStep+1 != steps.length) {
      return
    }
    // Create a new step
    let step = this.copyStep(steps[currentStep]);

    // Temporary, used for testing on premise "({P})({P}{Q}({R}))(((((({Q})){R}))))"
    // Manually sets the cutID to equal the otuside cut of the third portion of the premise
    // cutID = step.data[2].id

    // use findID to find the cut with the given ID
    let firstCut = this.findID(step, cutID);
    // If it is actually a cut and has another cut inside
    if (firstCut && firstCut.type === "cut") {
      let secondCut = firstCut.data;
      if(secondCut && secondCut.length === 1 && secondCut[0].type === "cut") {
        // Get the data inside the second cut
        let newContents = secondCut[0].data;
        // Remove the first cut from the data array
        const index = step.data.indexOf(firstCut);
        if (index > -1) {
          step.data.splice(index, 1);
        }
        // Add the contents of the second cut to the data array
        step.data = step.data.concat(newContents);
        // Update the state
        currentStep+=1;
        steps.push(step);
        this.setState({ steps: steps, currentStep: currentStep, data:data });
      }
    }
  }

  // Performs a deep copy of oldStep into newStep, used to not change previous steps
  // By allowing them to be copied without using a reference
  copyStep(oldStep) {
    let newStep = {};
    function copyDataMap(oldData) {
      let newData = {};
      for (let d in oldData) {
        // If an id or type if found, copy directly
        if(typeof oldData[d] === 'string') {
          newData[d] = oldData[d];
        }
        // Otherwise if an array is found, copy using helper function
        else {
          newData[d] = copyDataArray(oldData[d]);
        }
      }
      return newData;
    }
    function copyDataArray(oldData) {
      let newData = [];
      for (let d in oldData) {
        // If an ID is found (variable), copy directly
        if(typeof oldData[d] === 'string') {
          newData.push(oldData[d]);
        }
        // If a map was found (cut), copy using helper function
        else {
          newData.push(copyDataMap(oldData[d]));
        }
      }
      return newData;
    }
    // Copy the data, width, and height of the original into the new step
    newStep.data = copyDataArray(oldStep.data);
    newStep.h = oldStep.h;
    newStep.w = oldStep.w;
    return newStep;
  }

  // finds and returns the item with the specified ID in a given step
  findID(searchedStep, id) {
    // Find the ID in an array
    function findIDArray(arr) {
      for (let a in arr) {
        // if a string, aka an ID
        if (typeof arr[a] === 'string') {
          // return the ID if found
          if (arr[a] == id) {
            return id;
          }
        }
        // if a data map is found with the correct id, return the data map
        else if (arr[a].id === id) {
          return arr[a];
        // otherwise, call findID step on the datamap that has the incorrect ID
        } else {
          let s = findIDMap(arr[a]);
          if (s)
            return s;
        }
      }
    }
    // Finds the ID in a data map representing a step
    function findIDMap(step) {
      for (let s in step) {
        // if an array is found, call findIDArray on each element
        if (step[s] instanceof Array) {
          return findIDArray(step[s]);
        // if an id is found, check if it matches and return the data if so
        } else if (s === "id") {
          if (step[s] === id)
            return step;
        }
      }
    }
    return findIDMap(searchedStep);
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
