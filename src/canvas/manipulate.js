const nanoid = require('nanoid').nanoid;

module.exports = (state) => { 
  return {
    state: state,
    /* Given a copyID and insertID, the iteration function creates a new step,
     * and adds a copy of the data represented by copyID at the location of insertID
     * only if the location of insertID is a child of copyID
     */
    iteration: function (copyID, insertID) {
      let { steps, currentStep, data } = this.state;
      let step = this.copyStep(steps[currentStep]);
      // If the insertID data is not in a subgraph of the copID data, return
      if (!this.isInNestedGraph(step, insertID, copyID)) {
        console.log("Insert selection is not in a subgraph of Copy selection");
        return null;
      }
      // use findID to find the data represented by the two IDs
      let copy = this.copyContents(this.findID(step, copyID));
      if (!copy) {
        console.log("Copy ID could not be found in Iterate");
        return null;
      }
      let insert = this.findID(step, insertID);
      if (!insert) {
        console.log("Insert ID could not be found in Iterate");
        return null;
      }
      insert.data = insert.data.concat(copy);
      let newCopyID = copy;
      if (typeof copy !== 'string')
        newCopyID =  copy.id
      // Change the levels of the copy data
      this.changeCutLevel(step, newCopyID, data[insert.id].level + 1)
      // Update the state
      currentStep += 1;
      steps.push(step);
      return { steps: steps, currentStep: currentStep, data: data };
    },

    erasure: function (id) {
      let { steps, currentStep, data } = this.state;
      // Create a new step
      let step = this.copyStep(steps[currentStep]);
      // Find the data that will be erased
      let erased = this.findID(step, id);
      if (!erased) {
        return null;
      }
      // Get the parent of the erased section
      let parent = this.findParent(step, id)
      if (!parent) {
        return null;
      }
      // Remove the erased data from the parent's data array
      const index = parent.data.indexOf(erased);
      if (index > -1)
        parent.data.splice(index, 1);
      else {
        return null;
      }
      // Update the state
      currentStep += 1;
      steps.push(step);
      return { steps: steps, currentStep: currentStep, data: data };
    },

    /* Adds a double cut given the ID of the data that will be inside the cut.
    *  Will only run if the current step is the last step.
    */
    doubleCutAdd: function (ID) {
      let { steps, currentStep, data } = this.state;
      // create a new step
      let step = this.copyStep(steps[currentStep]);
      // use findID to find the data represented by the id
      // this is the data that will be inside the two new cuts
      let inside = this.findID(step, ID);
      if (!inside) {
        return null;
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
        return null;
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
      return { steps: steps, currentStep: currentStep, data:data };
    },

    /* Removes a double cut given the ID of the outside cut.
    *  Will only run if the current step is the last step.
    *  Creates a deep copy of the current step, and replaces the cut with
    *  the given ID with the contents of the second cut, only if they exist.
    *  Then adds the edited copy of the current step to the end of the step array.
    */
    doubleCutRemove: function (cutID) {
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
            return null;
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
          return { steps: steps, currentStep: currentStep, data:data };
        }
        else return null;
      }
      else return null;
    },


    /* Given a step and two IDs, will return true if the data of ChildID is
     * in a nested graph of parentID in the current step.
     */
    isInNestedGraph: function (step, childID, parentID) {
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
    },

    /* Given a step or a cut, will copy the contents inside with new IDs
     * and return the new data. This permits inserting new data into the graph.
     * Levels for cuts will start at 0 and increase accordingly
     */
    copyContents: function (step) {
      let { data } = this.state;
      // Copies the data of a map and returns it
      // Also updates the state.data map according to new generated IDs
      function copyDataMap(map, level) {
        // If a variable is passed it, add it to the data and return the new ID
        if (typeof map === 'string') {
          let id = nanoid();
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
      this.state.data = data;
      return newStep;
    },

    /* Given a step and the ID of a cut, will iterate through all cuts within
     * that cut and change their level by a specified amount.
    */
    changeCutLevel: function (step, id, change) {
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
      this.state.data = data;
    },

    // Performs a deep copy of oldStep into newStep, used to not change previous steps
    // By allowing them to be copied without using a reference
    copyStep: function (oldStep) {
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
    },

    /* Finds and returns the item that is the parent of the item
     * with the specified ID, given the step to search as well.
    */
    findParent: function (searchedStep, id) {
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
    },

    // finds and returns the item with the specified ID in a given step
    findID: function (searchedStep, id) {
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
  };
}