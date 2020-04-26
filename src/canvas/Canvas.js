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

function initXY(step, level, currData = {}) {
  /*






          FIX CURRDATA TO NOT EXIST ANYMORE








  */
  let data = currData
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
          //let { steps, currentStep } = this.state;
          //let step = steps[currentStep]
          //this.cloneStep(step)
          

          let { steps, currentStep } = this.state;
          if (currentStep+1 != steps.length) {
            return
          }
          let step = steps[currentStep]
          
          console.log(step)
          let cutID = step.data[1].data[0].id
          console.log(cutID)
          let firstCut = this.findID(step, cutID)
          console.log(firstCut)
          step = firstCut
          currentStep+=1;
          steps.push(step)
          this.setState({ steps: steps, currentStep: currentStep/*, data:data*/ });


          /*
          let { steps, currentStep } = this.state;
          if (currentStep+1 != steps.length) {
            return
          }
          let { premises, conclusion } = this.state.proof;
          let step = steps[currentStep]
          let i = 1
          let firstCut = step.data[i]
          let newContents;
          if (firstCut.type === "cut") {
            console.log("FOUND CUT")
            console.log(firstCut)
            let secondCut = firstCut.data;
            if(secondCut.length === 1 && secondCut[0].type === "cut") {
              console.log("FOUND DOUBLE CUT")
              console.log(secondCut)
              newContents = secondCut[0]
              console.log(newContents)

              let { stepZero, data } = initXY(convertToArray(premises.join('')), 0, this.state.data);
              console.log("stepZero")
              console.log(stepZero)
              console.log("step")
              console.log(step)
              stepZero.data[i] = newContents.data[0]
              steps.push(stepZero);
              currentStep+=1;
              this.setState({ steps: steps, currentStep: currentStep, data:data });
            }
          }
          */
          

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

  // finds and returns the item with the specified ID in a given step
  findID(searchedStep, id) {
    let data = this.state.data;
    //console.log("findID")

    // Find the ID in an array
    function findIDArray(arr) {
      for (let a in arr) {
        // if a string, aka an ID
        if (typeof arr[a] === 'string') {
          // return the ID if found
          if (arr[a] == id) {
            //console.log("FOUND THE SEARCHED ID: ", arr[a], id)
            return id
          }
          //console.log("FOUND STRING IN ARR", arr[a])
        }
        // if a data map is found with the correct id, return the data map
        else if (arr[a].id === id) {
          //console.log("arr[a].id: ", arr[a].id)
          //console.log(arr[a])
          return arr[a];
        // otherwise, call findID step on the datamap that has the incorrect ID
        } else {
          //console.log("ELSE", arr[a])
          return findIDStep(arr[a], id)
        }
      }
    }

    // Finds the ID in a step, or a data map representing a step
    function findIDStep(step) {
      for (let s in step) {
        // if an array is found, call findIDArray on each element
        if (step[s] instanceof Array) {
          //console.log("FOUND ARRAY", step[s])
          return findIDArray(step[s], id)
        // if an id is found, check if it matches and return the data if so
        } else if (s === "id") {
          //console.log("FOUND ID", id, step[s])
          //console.log(step)
          if (step[s] === id)
            return step
        // Otherwise if the element is something else (w, h, type, etc.), do nothing
        } else if (typeof s === 'string') {
          //console.log("FOUND STRING", step[s])
        }
      }
    }
    //console.log("Step: ",searchedStep)
    //console.log("ID: ", id)
    let c = findIDStep(searchedStep, id)
    console.log("C: ", c)
    return c
  }

  cloneStep(oldStep) {
    console.log("OLDSTEP")
    console.log(oldStep)
    let i = 0
    function cloneData(oldData) {
      i++;
      console.log("LEVEL", i)
      for (let s in oldData) {
        if (oldData[s] instanceof Array) {
          console.log("ARRAY", oldData[s])
        }
        else if (typeof oldData[s] === 'string') {
          console.log("STRING", oldData[s])
          if (s === "id")
            console.log("ID FOUND", s, oldData[s] )
        }
        else {
          console.log(typeof oldData[s], s, oldData[s])
          cloneData(oldData[s])
        }
      }
    }
    let newStep = {
      data: cloneData(oldStep.data),
      h: oldStep.h,
      w: oldStep.w
    }
    console.log(newStep)
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
