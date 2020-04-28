import React from 'react';
import { convertToArray } from '../converters';
import Toolbox from './Toolbox';
import StepMenu from './StepMenu';
import EGVariable from './EGVariable';
import EGCut from './EGCut';
import './Canvas.scss';
import Panzoom from 'panzoom';
import config from './config';
import { NotificationContainer, NotificationManager } from 'react-notifications';
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
    this.state = {
      proof: {
        premises: premises,
        conclusion: conclusion
      },
      steps: steps || [],
      data: data || {},
      currentStep: 0,
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
          return this.erasure(id);
        },
        iterate: (id) => {
          console.log("ITERATION")
          return this.iteration(id, this.state.steps[this.state.currentStep].data[0].id);
        },
        dcRemove: (id) => {
          console.log("DOUBLE CUT Remove")
          return this.doubleCutRemove(id);
        },
        dcAdd: (id) => {
          console.log("DOUBLE CUT Add")
          return this.doubleCutAdd(id);
          
        }
      }
    }
  }

  startSelection(selectable, nameOfFunction) {
    let { steps, currentStep } = this.state;
    // only allow steps to be conducted at the end of a proof
    if (currentStep+1 !== steps.length) {
      return
    }
    this.setState({ 
      highlights: selectable, 
      interaction: false, 
      cbFunction: (id) => {
        let successful = this.state.functions[nameOfFunction](id); 
        if (successful) 
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

  /* Given a copyID and insertID, the iteration function creates a new step,
   * and adds a copy of the data represented by copyID at the location of insertID
   * only if the location of insertID is a child of copyID
   */
  iteration(copyID, insertID) {
    let { steps, currentStep, data } = this.state;
    let step = this.copyStep(steps[currentStep]);
    // If the insertID data is not in a subgraph of the copID data, return
    if (!this.isInNestedGraph(step, insertID, copyID)) {
      console.log("Insert selection is not in a subgraph of Copy selection");
      return false;
    }
    // use findID to find the data represented by the two IDs
    let copy = this.copyContents(this.findID(step, copyID));
    if (!copy) {
      console.log("Copy ID could not be found in Iterate");
      return false;
    }
    let insert = this.findID(step, insertID);
    if (!insert) {
      console.log("Insert ID could not be found in Iterate");
      return false;
    }
    insert.data = insert.data.concat(copy);
    let newCopyID = copy;
    if (typeof copy !== 'string')
      newCopyID =  copy.id
    // Change the levels of the copy data
    this.setState( { data: data });
    this.changeCutLevel(step, newCopyID, data[insert.id].level + 1)
    // Update the state
    currentStep+=1;
    steps.push(step);
    this.setState({ steps: steps, currentStep: currentStep, data:data });
    return true;
  }

  erasure(id) {
    let { steps, currentStep, data } = this.state;
    // Create a new step
    let step = this.copyStep(steps[currentStep]);
    // Find the data that will be erased
    let erased = this.findID(step, id);
    if (!erased) {
      return false;
    }
    // Get the parent of the erased section
    let parent = this.findParent(step, id)
    if (!parent) {
      return false;
    }
    // Remove the erased data from the parent's data array
    const index = parent.data.indexOf(erased);
    if (index > -1)
      parent.data.splice(index, 1);
    else {
      return false;
    }
    // Update the state
    currentStep+=1;
    steps.push(step);
    this.setState({ steps: steps, currentStep: currentStep, data:data });
    return true;
  }

  /* Adds a double cut given the ID of the data that will be inside the cut.
  *  Will only run if the current step is the last step.
  */
  doubleCutAdd(ID) {
    let { steps, currentStep, data } = this.state;
    // create a new step
    let step = this.copyStep(steps[currentStep]);
    // use findID to find the data represented by the id
    // this is the data that will be inside the two new cuts
    let inside = this.findID(step, ID);
    if (!inside) {
      return false;
    }
    // create a new cut with another one inside it
    let cut1_id = nanoid();
    let cut2_id = nanoid();
    let cut2 = {
      data: [inside],
      id: cut2_id,
      type: "cut"
    }
    let cut1 = {
      data: [cut2],
      id: cut1_id,
      type: "cut"
    }
    // Set the levels of the two cuts
    let level = data[ID].level
    data[cut2_id] = { type: "cut", level: level + 1};
    data[cut1_id] = { type: "cut", level: level};
    // increase the level of the inside cut along with all cuts inside of it by 2
    this.changeCutLevel(step, ID, 2)

    // get the parent of the selection
    let parent = this.findParent(step, ID)
    if (!parent) {
      return false;
    }
    // Add the contents of the new cuts to the data array
    // after removing the original contents
    const index = parent.data.indexOf(inside);
    if (index > -1) {
      parent.data.splice(index, 1);
    }
    parent.data = parent.data.concat(cut1);
    // Change the state data accordingly
    currentStep+=1;
    steps.push(step);
    this.setState({ steps: steps, currentStep: currentStep, data:data });
    return true;
  }

  /* Removes a double cut given the ID of the outside cut.
  *  Will only run if the current step is the last step.
  *  Creates a deep copy of the current step, and replaces the cut with
  *  the given ID with the contents of the second cut, only if they exist.
  *  Then adds the edited copy of the current step to the end of the step array.
  */
  doubleCutRemove(cutID) {
    let { steps, currentStep, data } = this.state;
    // Create a new step
    let step = this.copyStep(steps[currentStep]);

    // use findID to find the cut with the given ID
    let firstCut = this.findID(step, cutID);
    // If it is actually a cut and has another cut inside
    if (firstCut && firstCut.type === "cut") {
      let secondCut = firstCut.data;
      if (secondCut && secondCut.length === 1 && secondCut[0].type === "cut") {
        // Get the data inside the second cut
        let newContents = secondCut[0].data;
        // Get the parent of the original cut being removed
        let parent = this.findParent(step, cutID)
        if (!parent) {
          return false;
        }
        this.changeCutLevel(step, secondCut[0].id, -2)
        // Remove the first cut from the data array
        const index = parent.data.indexOf(firstCut);
        if (index > -1) {
          parent.data.splice(index, 1);
        }
        // Add the contents of the second cut to the data array
        parent.data = parent.data.concat(newContents);
        // Update the state
        currentStep+=1;
        steps.push(step);
        this.setState({ steps: steps, currentStep: currentStep, data:data });
        return true;
      }
      else return false;
    }
    else return false;
  }


  /* Given a step and two IDs, will return true if the data of ChildID is
   * in a nested graph of parentID in the current step.
   */
  isInNestedGraph(step, childID, parentID) {
    let parentStep = this.findParent(step, parentID);
    if (!parentStep) {
      console.log("Parent Data could not be found");
      return false;
    }
    let childStep = this.findID(parentStep, childID);
    if (!childStep) {
      console.log("Child is not in nested graph of Parent");
      return false;
    }
    return true;
  }

  /* Given a step or a cut, will copy the contents inside with new IDs
   * and return the new data. This permits inserting new data into the graph.
   * Levels for cuts will start at 0 and increase accordingly
   */
  copyContents(step) {
    let { data } = this.state;
    // Copies the data of a map and returns it
    // Also updates the state.data map according to new generated IDs
    function copyDataMap(map, level) {
      // If a variable is passed it, add it to the data and return the new ID
      if (typeof map === 'string') {
        let id = nanoid();
        console.log("TEST")
        data[id] = {
            type: "var",
            var: data[map].var,
            x: data[map].x,
            y: data[map].y,
            level: data[map].level
        }
        return id;
      }
      let newMap = {};
      for (let m in map) {
        // If an ID is found, generate a new one
        if (m === 'id') {
          let id = nanoid();
          newMap[m] = id;
          // Add the new data to state.data via a deep copy
          data[id] = {
            type: "cut",
            level: level
          }
        }
        // Otherwise, if not a data array, copy the contents
        else if (m !== 'data'){
          newMap[m] = map[m]
        }
        // If a data array, copy using helper function
        else {
          newMap[m] = copyDataArray(map[m], level+1)
        }
      }
      return newMap;
    }
    // Copies the data of an array and returns it
    // Also updates state.data according to new generated IDs
    function copyDataArray(arr, level) {
      let newArr = [];
      for (let a in arr) {
        // If an ID found, generate a new one
        if (typeof arr[a] === 'string') {
          let id = nanoid();
          newArr.push(id);
          // Add the new data to state.data via a deep copy
          data[id] = {
            type: "var",
            var: data[arr[a]].var,
            x: data[arr[a]].x,
            y: data[arr[a]].y,
            level: data[arr[a]].level
          }
        }
        // otherwise, call the other helper function to copy contents
        else {
          newArr.push(copyDataMap(arr[a], level))
        }
      }
      return newArr;
    }
    let newStep = copyDataMap(step, 0);
    this.setState({ data: data })
    return newStep;
  }

  /* Given a step and the ID of a cut, will iterate through all cuts within
   * that cut and change their level by a specified amount.
  */
  changeCutLevel(step, id, change) {
    let { data } = this.state
    // If the ID is for a variable, only increase it's level
    if (data[id] && data[id].type === "var") {
      data[id].level += change;
      return
    }
    // when true, the levels should change in the functions below
    let idFound = false
    // Changes the 
    function changeLevelMap(map) {
      // get the id for the current map
      let mapID;
      if (map.id) {
        mapID = map.id
        // if it matches the id being searched, update the boolean
        if (mapID === id) {
          idFound = true;
        }
      }
      // If the ID has been found, update the level of the current cut
      if (idFound) {
        data[mapID].level += change;
      }
      // call the function of the data array if it exists
      if (map.data){
        changeLevelArray(map.data);
      }
    }
    function changeLevelArray(arr) {
      for (let a in arr) {
        // If a non-string is found (a cut)
        if (typeof arr[a] !== 'string') {
          // Change the level of the cut
          changeLevelMap(arr[a])
        }
        // If string is found, change the level of the variable
        else if (idFound){
          data[arr[a]].level += change;
        }
      }
    }
    changeLevelArray(step.data)
    this.setState({ data: data })
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

  /* Finds and returns the item that is the parent of the item
   * with the specified ID, given the step to search as well.
  */
  findParent(searchedStep, id) {
    // holds the parent of the id
    let parent = searchedStep
    // Searches an array for the ID, returns true if it is found
    function findInArray(arr) {
      for (let a in arr) {
        // If an ID is found, compare it
        if (typeof arr[a] === 'string') {
          if (arr[a] === id) {
            return true;
          }
        }
        // Otherwise if a datamap is found, check the ID
        else {
          // If ID matches, return true
          if (arr[a].id && arr[a].id === id) {
            return true;
          }
          // Otherwise, search the datamap
          else {
            findInMap(arr[a])
          }
        }
      }
      return false;
    }
    function findInMap(map) {
      // if the map contains data, search the data
      if (map.data) {
        // if found, set parent to this map
        if(findInArray(map.data)) {
          parent = map;
        }
      }
    }
    findInArray(searchedStep.data);
    return parent;
  }

  // finds and returns the item with the specified ID in a given step
  findID(searchedStep, id) {
    // Find the ID in an array
    function findIDArray(arr) {
      for (let a in arr) {
        // if a string, aka an ID
        if (typeof arr[a] === 'string') {
          // return the ID if found
          if (arr[a] === id) {
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
      if (typeof step === 'string') {
        if (step === id)
          return step;
        else
          return
      }
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
          } else {
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
      this.setState({ steps: steps, data: data });
    }
    // required to use setState to trigger re-render after creation of panzoom
    this.setState({ currentStep: 0 });
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
    let zoomWithWheel = () => {}
    let { steps, currentStep } = this.state;
    if (this.panzoom)
      zoomWithWheel = this.panzoom.zoomWithWheel
    return (
      <div>
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
        />
      </div>
    );
  }
}

export default Canvas;
