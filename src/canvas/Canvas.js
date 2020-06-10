import React from 'react';
import { convertToArray } from '../converters';
import Toolbox from './Toolbox';
import StepMenu from './StepMenu';
import EGVariable from './EGVariable';
import EGCut from './EGCut';
import './Canvas.scss';
import Panzoom from 'panzoom';
import DropdownMenu from './DropdownMenu';
import config from './config';
import manipulate from './manipulate';
import { CSSTransitionGroup } from 'react-transition-group';
const nanoid = require('nanoid').nanoid;

/**
 * Where a lot of the action happens. This component renders the Canvas for 
 * the Existential Graphs workspace. Meant to take up an entire page.
 */

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
        step[s] = { data: initXYRecurse(step[s], level + 1), id: id, type: "cut" }
        data[id] = { type: "cut", level: level }
      } else {
        let X = currentX;
        let Y = currentY;
        let id = nanoid()
        data[id] = { 
          type: "var",
          var: step[s], 
          x: Math.round(X/config.gridSize)*config.gridSize, 
          y: Math.round(Y/config.gridSize)*config.gridSize,
          level: level
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
    this.highlightCut = this.highlightCut.bind(this);
    this.startSelection = this.startSelection.bind(this);

    let { premises, conclusion, steps, data } = this.props.proof;
    console.log(steps.length - 1)
    this.state = {
      proof: {
        premises: premises,
        conclusion: conclusion
      },
      changeHistory: [], 
      redoHistory: [],
      steps: steps || [],
      data: data || {},
      currentStep: steps.length !== 0 ? steps.length - 1 : 0,
      moveListeners: [],
      highlights: {
        cut: 'none', // 'none', 'odd', 'even', 'all'
        var: 'none'
      },
      cbFunction: null,
      interaction: true,
      functions: {
        insert: (id) => {
          console.log("INSERTION")
        },
        erase: (id) => {
          console.log("ERASURE")
          return manipulate(this.state).erasure(id);
        },
        iterate: (id) => {
          console.log("ITERATION")
          return manipulate(this.state).iteration(id, this.state.steps[this.state.currentStep].data[0].id);
        },
        dcRemove: (id) => {
          console.log("DOUBLE CUT Remove")
          return manipulate(this.state).doubleCutRemove(id);
        },
        dcAdd: (id) => {
          console.log("DOUBLE CUT Add")
          return manipulate(this.state).doubleCutAdd(id);
          
        }
      }
    }
  }

  startSelection(selectable, nameOfFunction) {
    let { steps, currentStep, changeHistory } = this.state;
    changeHistory = changeHistory.slice()
    changeHistory.push({ steps: Array.from(steps) });
    // only allow steps to be conducted at the end of a proof
    if (currentStep+1 !== steps.length) {
      return
    }
    this.setState({ 
      highlights: selectable, 
      interaction: false, 
      cbFunction: (id) => {
        let state = this.state.functions[nameOfFunction](id); 
        if (state) 
          this.setState({ 
            changeHistory: changeHistory, 
            redoHistory: [],
            ...state });
        this.setState({  
          highlights: {
            cut: 'none', 
            var: 'none'
          },
          interaction: true, 
          cbFunction: null });
      }
    });
  }

  changePos(id, x, y) {
    let { data } = this.state;
    Object.assign(data[id], { x: x, y: y })
    this.setState(data)
  }

  highlightCut(level) {
    if (this.state.highlights.cut === 'all') return true;
    let odd = false;
    if (level % 2 === 1) odd = true;
    if (this.state.highlights.cut === 'odd' && odd) return true;
    else if (this.state.highlights.cut === 'even' && !odd) return true;
    return false;
  }

  highlightVar(level) {
    if (this.state.highlights.var === 'all') return true;
    let odd = false;
    if (level % 2 === 1) odd = true;
    if (this.state.highlights.var === 'odd' && odd) return true;
    else if (this.state.highlights.var === 'even' && !odd) return true;
    return false;
  }

  renderStep(stepIndex) {
    let { data } = this.state;
    let step = this.state.steps[stepIndex]
    if (step) {
      const setXY = (id,x,y) => {
        data[id].x = x;
        data[id].y = y;
        this.setState({ data: data })
      }

      const renderRecurse = (step) => {
        let jsx = [];
        if (step.length === 0) {
          let id = nanoid();
          data[id] = {};
          setXY(id, 0, 0);
          data[id].type = "emptyvar";
          data[id].var = "\xa0";
          step.push(id);
          this.setState({ data: data });
        }
        for (let s in step) {
          if (step[s].type === "cut") {
            let level = data[step[s].id].level;
            let groupElement = (
              <EGCut 
                level={level} 
                enableHighlight={this.highlightCut(level)}
                id={step[s].id}
                selectedCallback={this.state.cbFunction}>
                {renderRecurse(step[s].data)}
              </EGCut>
            );
            jsx.push(groupElement);
          } else if (this.state.data[step[s]].type === "var") {
            let el = this.state.data[step[s]];
            let level = data[step[s]].level;
            jsx.unshift(
              <EGVariable 
                x={el.x} 
                y={el.y} 
                id={step[s]} 
                enableHighlight={this.highlightVar(level)}
                selectedCallback={this.state.cbFunction}
                panzoom={this.panzoom}
                interaction={this.state.interaction || this.highlightVar(level)}
                getCoords={this.getSVGCoords}
                setCoords={(x,y) => setXY(step[s],x,y)}
                key={step[s]}>
                {el.var}
              </EGVariable>
            );
          } else if (this.state.data[step[s]].type === "emptyvar") {
            let el = this.state.data[step[s]];
            jsx.unshift(
              <EGVariable 
                x={el.x} 
                y={el.y} 
                id={step[s]} 
                enableHighlight={false}
                selectedCallback={() => {}}
                panzoom={this.panzoom}
                interaction={this.state.interaction}
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
      let { premises } = this.state.proof;
      let { stepZero, data } = initXY(convertToArray(premises.join('')), 0);
      steps.push(stepZero);
      this.setState({ steps: steps, data: data });
    }
    // required to use setState to trigger re-render after creation of panzoom
    this.setState({ });
    let step = this.state.steps[this.state.currentStep];

    // center the canvas elements
    this.panzoom.moveTo(vw/2 - step.w, vh/2 - step.h);
    this.panzoom.zoomTo(vw/2 - step.w, vh/2 - step.h, 2);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this);
  }

  /**
   * @param  {int} X on the DOM
   * @param  {int} Y on the DOM
   * @return {(int, int)} x,y pair representing point on Canvas
   */
  getSVGCoords(domX, domY) {
    var pt = this.canvasContainer.current.createSVGPoint();
    pt.x = domX;
    pt.y = domY;
    return pt.matrixTransform(this.canvas.current.getScreenCTM().inverse());
  }

  render() {
    let { proof, data, steps, currentStep } = this.state; 
    // every time a re-render happens, ensure top-level state is up-to-date
    this.props.saveProof({...proof, data, steps});
    // zooming function does nothing unless panzoom is initialized
    let zoomWithWheel = () => {}
    if (this.panzoom)
      zoomWithWheel = this.panzoom.zoomWithWheel
    // CSSTransitionGroup lets us have entry fade-in
    return (
      <CSSTransitionGroup
        transitionName="fadein"
        transitionAppear={true}
        transitionAppearTimeout={500}
        transitionEnter={false}
        transitionLeaveTimeout={300}>
        <div key={'main-div'} className="noselect">
          <DropdownMenu 
            menuItems={this.props.menuItems}/>
          <Toolbox 
            hidden={currentStep+1 !== steps.length}
            functions={this.state.functions}
            setSelection={this.startSelection}
          />
          <svg 
            ref={this.canvasContainer}
            className="canvas noselect" 
            onWheel={zoomWithWheel} >
            <g ref={this.canvas}>
              {this.panzoom && this.renderStep(this.state.currentStep)}
            </g>
          </svg>
          <StepMenu 
            currentStep={this.state.currentStep} 
            stepInfo={this.state.steps} 
            setStep={s => this.setState({ currentStep: s, interaction: s === this.state.steps.length - 1 })}
            state={this.state}
            setState={(changeHistory, newSteps, redoHistory) => {
              this.setState({ changeHistory: changeHistory, steps: newSteps, redoHistory: redoHistory, currentStep: newSteps.length - 1 });
            }}
          />
        </div>
      </CSSTransitionGroup>
    );
  }
}

export default Canvas;
