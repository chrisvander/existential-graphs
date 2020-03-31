import verifySentence from './verifySentence';

const operators = require('./operators.json')

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const binaryOperators = operators.binary
let keys = Object.keys(binaryOperators);
keys = keys.map(el => escapeRegExp(el));
const binaryRegex = new RegExp('(?:' + keys.join('|') + ')', 'g')

const unaryOperators = operators.unary

const convertToTeX = (formula) => {
  if (typeof formula === 'string' || formula instanceof String) {
    // filter out spaces
    formula = formula.replace(/\s/g, '')
    let symbol
    // replace all binary operators
    while ((symbol = binaryRegex.exec(formula)) !== null) {
      formula = formula.substr(0,symbol['index']) 
                    + binaryOperators[symbol[0]] + ' '
                    + formula.substr(symbol['index'] + symbol[0].length);
    }
    // replace all unary operators
    for (let i in Object.keys(unaryOperators)) {
      symbol = Object.keys(unaryOperators)[i];
      formula = formula.replace(new RegExp(escapeRegExp(symbol), 'g'), unaryOperators[symbol] + ' ');
    }
    // filter out all other characters
    formula = formula.replace(/[^()A-Za-z\\\s]/g, '')
    return formula
  }
  else return ""
}

const convertToEG = (formula) => {
  if ((typeof formula === 'string' || formula instanceof String) && verifySentence(formula)) {

  }
  else return null;
}

export {
  convertToTeX,
  convertToEG,
  verifySentence
}