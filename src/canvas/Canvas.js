import React from 'react';
import { convertToArray, convertToTeX, convertToEG } from '../converters';
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
// KATEX
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

const nanoid = require('nanoid').nanoid;

/**
 * Where a lot of the action happens. This component renders the Canvas for 
 * the Existential Graphs workspace. Meant to take up an entire page.
 */

function initXY(step, level) {
  if (!level) level = 0
  let data = {}
  let currentX = 0
  let currentY = 0
  let maxX = 0
  let maxY = 0

  // gapSize should be equal to the number of level changes
  // in between two variables, so that we can evenly place 
  // them initially across the screen
  function initXYRecurse(step, level, gapSize) {
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
  return { stepZero: { data: initXYRecurse(step, level), h: maxY, w: maxX }, data: data }
}

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.canvasContainer = React.createRef();

    this.renderStep = this.renderStep.bind(this);
    this.checkLevelIntegrity = this.checkLevelIntegrity.bind(this);
    this.changePos = this.changePos.bind(this);
    this.getSVGCoords = this.getSVGCoords.bind(this);
    this.highlightCut = this.highlightCut.bind(this);
    this.modifyCanvas = this.modifyCanvas.bind(this);
    this.getInsertionPoint = this.getInsertionPoint.bind(this);
    this.requestInput = this.requestInput.bind(this);
    this.cancelSelection = this.cancelSelection.bind(this);
    this.createElement = this.createElement.bind(this);
    this.clickedCanvas = this.clickedCanvas.bind(this);
    this.initXY = initXY;

    this.moveVars = {};
    this.getSelection = this.getSelection.bind(this);

    let { premises, conclusion, steps, data } = this.props.proof;
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
        var: 'none',
        canvas: false
      },
      cbFunction: null,
      finishCB: null,
      interaction: true,
      functions: {
        insertion: () => manipulate(this).insertion(),
        erasure: () => manipulate(this).erasure(),
        iteration: () => manipulate(this).iteration(),
        deiteration: () => manipulate(this).deiteration(),
        doubleCutRemove: () => manipulate(this).doubleCutRemove(),
        doubleCutEnclose: () => manipulate(this).doubleCutEnclose(),
        doubleCutAdd: () => manipulate(this).doubleCutAdd(),
      },
      formula: '',
      eg: '',
      fitchNotation: false
    }
  }

  /**
   * Function to select a point on the canvas or inside a cut, where the x,y coordinate
   * gets returned along with a cut ID, if selected.
   */
  getInsertionPoint(cutConfig) {
    let getCanvasInsertion = new Promise((resolve, reject) => {
      this.setState({
        canvasCb: (x,y) => {
          this.setState({ canvasCb: null })
          
          setTimeout(() => {
            if (this.state.cbFunction) {
              this.state.cbFunction(null);
              this.setState({ cbFunction: null }, () => resolve({ x, y }));
            } else resolve({ x, y });
          }, 50);
        }
      })
    });
    return new Promise(async (resolve, reject) => {
      let data = await Promise.all([this.getSelection({
        'cut': 'all',
        'var': 'none',
        'canvas': true,
        ...cutConfig
      }), getCanvasInsertion])
      if (this.state.finishCB) {
        this.state.finishCB();
      }
      this.setState({  
        highlights: {
          cut: 'none', 
          var: 'none',
          canvas: false
        },
        finishCB: null,
        canvasCb: null,
        interaction: true, 
        cbFunction: null }, () => {
          let [id, { x, y }] = data;
          resolve({ id, x, y });
        });
    })
  }

  /**
   * Function to enable selection of a cut or variable.
   * @param  {Object} selectConfig  object that contains highlight selection params
   *
   * selectConfig object should look like { 'cut': 'all', 'var': 'all' }
   * Omitted 'cut' or 'var' will result in either not allowing selection. Beyond 'all',
   * 'even' or 'odd' level cuts can be specified.
   */
  getSelection(selectConfig) {
    return new Promise((resolve, reject) => {
      let { steps, currentStep } = this.state;
      // only allow steps to be conducted at the end of a proof
      if (currentStep+1 !== steps.length) {
        return
      }
      this.setState({ 
        highlights: selectConfig, 
        interaction: false, 
        cbFunction: (id) => {
          this.setState({  
            highlights: {
              cut: 'none', 
              var: 'none',
              canvas: false
            },
            interaction: true, 
            cbFunction: null }, () => resolve(id));
        }
      });
    });
  }

  modifyCanvas(nameOfFunction, finishedCb) {
    // before we modify the canvas, let's save the current state
    let { steps, changeHistory } = this.state;
    changeHistory = changeHistory.slice()
    changeHistory.push({ steps: Array.from(steps) });
    // okay, now we call the requested function from Toolbox
    this.setState({ finishCB: finishedCb }, () => {
      this.state.functions[nameOfFunction]().then(state => {
        if (this.state.finishCB) {
          this.state.finishCB();
        }
        if (state) {
          // now we can apply the new changeHistory
          this.setState({ 
            changeHistory: changeHistory, 
            redoHistory: [],
            ...state });
          this.checkLevelIntegrity();
        }
      });
    });
  }

  checkLevelIntegrity() {
    let { steps, data, currentStep } = this.state;
    let step = steps[currentStep];
    function verifyLevel(dobj, level) {
      for (let i in dobj) {
        let ob = dobj[i];
        let ids = []
        if (ob.type && ob.type === 'cut') {
          dobj[i].data = verifyLevel(ob.data, level+1);
          ids.push(ob.id);
        }
        else ids.push(ob);
        for (let i in ids) {
          data[ids[i]].level = level;
        }
      }
      if (dobj.length > 1)
        dobj = dobj.filter(el => el.id || (!el.id && data[el].var !== '\xa0'));
      return dobj
    }
    steps[currentStep].data = verifyLevel(step.data, 0);
    this.setState({ steps, data });
  }

  cancelSelection() {
    let { cbFunction, canvasCb, finishCB } = this.state;
    if (cbFunction) cbFunction();
    if (canvasCb) canvasCb();
    if (finishCB) finishCB();
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

  createElement(text, type, currentStep, x, y) {
    let { data } = this.state;
    let id = nanoid();
    data[id] = {};
    data[id].x = x || 0;
    data[id].y = y || 0;
    data[id].type = type;
    data[id].var = text;
    currentStep.push(id);
    this.setState({ data });
  }

  removeElement(id) {
    let { steps } = this.state;
    steps[this.state.currentStep].push(id);
  }

  renderStep(stepIndex) {
    let { data } = this.state;
    let step = this.state.steps[stepIndex];
    if (step) {
      const setXY = (id,x,y) => {
        data[id].x = x;
        data[id].y = y;
        this.setState({ data: data });
      }

      const renderRecurse = (step) => {
        let jsx = [];
        if (step.length === 0) {
          this.createElement("\xa0", "emptyvar", step, 0, 0);
        }
        for (let s in step) {
          if (step[s].type === "cut") {
            if (!data[step[s].id]) {
              data[step[s].id] = { var: " ", type: "emptyvar" };
            }
            let level = data[step[s].id].level;
            const ids = [];
            const getIds = (step) => {
              if (step.data) 
                for (let i in step.data)
                  getIds(step.data[i]);
              else ids.push(step);
            }
            getIds(step[s])
            let groupElement = (
              <EGCut 
                level={level} 
                enableHighlight={this.highlightCut(level)}
                id={step[s].id}
                panzoom={this.panzoom}
                getCoords={this.getSVGCoords}
                setCoords={(x,y) => {
                  ids.forEach(id => {
                    this.moveVars[id](x,y);
                  });
                }}
                key={step[s].id}
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
                subscribeMove={f => this.moveVars[step[s]] = f}
                key={step[s]}>
                {el.var}
              </EGVariable>
            );
          } else if (this.state.data[step[s]].type === "emptyvar" && step.length === 1) {
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
                subscribeMove={f => this.moveVars[step[s]] = f}
                key={step[s]}>
                {el.var}
              </EGVariable>
            );
          }
        }
        return jsx;
      }
      renderRecurse.bind(this);
      return renderRecurse(step.data, (f)=>{})
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

  clickedCanvas(e) {
    if (this.state.canvasCb) {
      let { x, y } = this.getSVGCoords(e.pageX,e.pageY)
      this.state.canvasCb(x,y);
    }
  }

  requestInput() {
    return new Promise((resolve, reject) => {
      this.setState({ 
        showOverlay: true,
        cbFunction: (formula) => {
          if (formula == null) resolve(null);
          else resolve(formula);
          this.setState({ showOverlay: false, cbFunction: null });
        } 
      });
    });
  }

  render() {
    let { proof, data, steps, currentStep, highlight, showOverlay } = this.state;
    // every time a re-render happens, ensure top-level state is up-to-date
    this.props.saveProof({...proof, data, steps});
    // zooming function does nothing unless panzoom is initialized
    let zoomWithWheel = () => {}
    if (this.panzoom)
      zoomWithWheel = this.panzoom.zoomWithWheel
    // CSSTransitionGroup lets us have entry fade-in
    let tex = convertToTeX(this.state.formula);
    let eg = convertToEG(`(${this.state.formula})`);

    return (
      <CSSTransitionGroup
        transitionName="fadein"
        transitionAppear={true}
        transitionAppearTimeout={500}
        transitionEnter={false}
        transitionLeaveTimeout={300}>
        <div className={`insertOverlay${showOverlay ? ' shown' : ''}`}>
          <h2>Fitch-Style Formula to Insert</h2>
          {false && (<React.Fragment>
            <input 
              name="notation" 
              type="checkbox" 
              className="check" 
              onChange={ (e) => {
                this.setState({ fitchNotation: !this.state.fitchNotation }); 
              }} />
              <label for="notation">&nbsp;Use Fitch-style notation</label><br /></React.Fragment>)}
          <div>
            <table>
              <tbody>
                <tr>
                  <td style={{ width: '40%' }}>
                    <input onChange={ (e) => this.setState({ formula: e.target.value, eg: convertToEG(e.target.value) }) } />
                  </td>
                  <td>
                    {tex && <TeX math={tex} />}
                  </td>
                </tr>
                <tr />
              </tbody>
            </table>
            To insert: {eg && <TeX math={eg} />}
          </div>
          { false && <div>
            <input onChange={ (e) => this.setState({ formula: e.target.value, eg: e.target.value }) } /><br />
            To insert: <TeX math={this.state.formula} />
          </div>}
          <span className='buttons'>
            <button onClick={() => this.state.cbFunction(this.state.eg)}>Insert</button>
            <button onClick={() => this.state.cbFunction(null)}>Cancel</button>
          </span>
        </div>
        <div key={'main-div'} className={`mainCanvas noselect${showOverlay ? ' disabled' : ''}`}>
          <DropdownMenu 
            menuItems={this.props.menuItems}/>
          <Toolbox 
            hidden={currentStep+1 !== steps.length}
            functions={this.state.functions}
            modifyCanvas={this.modifyCanvas}
            cancelSelection={this.cancelSelection}
          />
          <svg 
            ref={this.canvasContainer}
            className="canvas noselect" 
            onWheel={zoomWithWheel} 
            onClick={this.clickedCanvas}
            onMouseEnter={() => this.setState({ highlight: true })}
            onMouseLeave={() => this.setState({ highlight: false })}
            style={this.state.canvasCb ? {
              cursor: 'crosshair',
              backgroundColor: "white"
            } : {}}>
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
              this.setState({ 
                changeHistory: changeHistory, 
                steps: newSteps, 
                redoHistory: redoHistory, 
                currentStep: newSteps.length - 1 
              });
            }}
          />
        </div>
      </CSSTransitionGroup>
    );
  }
}

export default Canvas;
