import verifySentence, { 
  parenthesisRegex, 
  binaryRegex,
  atomicRegex
} from './verifySentence';

const operators = require('./operators.json')

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const binaryOperators = operators.binary
let keys = Object.keys(binaryOperators);
keys = keys.map(el => escapeRegExp(el));
const binarySymbReplace = new RegExp('(?:' + keys.join('|') + ')', 'g')

const unaryOperators = operators.unary

const convertToTeX = (formula) => {
  if (typeof formula === 'string' || formula instanceof String) {
    // filter out spaces
    formula = formula.replace(/\s/g, '')
    let symbol
    // replace all binary operators
    while ((symbol = binarySymbReplace.exec(formula)) !== null) {
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

function countUnary(statement) {
  const matchesList = (val) => (op) => op === val;
  let c = 0;
  for (c in statement.split(""))
    if (!Object.keys(unaryOperators).some(matchesList(statement.charAt(c))))
      break;
  return c;
}

const stripUnary = (s, convertStatement) => {
  if (convertStatement == null) 
    convertStatement = true;
  let c = countUnary(s);
  let statement = s.substr(c)
  console.log(statement)
  if (convertStatement) statement = convertToEG(statement)
  return "(".repeat(c) + statement + ")".repeat(c)
}

const convertToEG = (formula) => {
  if ((typeof formula === 'string' || formula instanceof String) && verifySentence(formula)) {
    // filter out spaces
    formula = formula.replace(/\s/g, '')
    let binary = binaryRegex.exec(formula)
    let parenthesis = parenthesisRegex.exec(formula)
    let unary = atomicRegex.exec(formula)
    if (binary) {
      let left = convertToEG(binary[1])
      let right = convertToEG(binary[4])
      let symConversion = operators.eg[binary[3]];
      return symConversion.replace(/\$1/g, left).replace(/\$2/g, right)
    } else if (parenthesis) {
      if (countUnary(formula) != 0) {
        return stripUnary(formula)
      }
      return convertToEG(parenthesis[1]);
    } else if (unary) {
      return stripUnary(formula, false);
    } else return null;
  }
  else return null;
}

/*  Converts a string representing an Existential Graph into
 *  a nested array. For example: 
 *  "((({P})){Q}{R}){P}" => [ [ [['P']],'Q','R' ],'P' ]
 */
const convertToArray = (formula) => {
  if (typeof formula === 'string' || formula instanceof String) {
    //let index = 0;
    return null



  }
  else return null
}

export {
  convertToTeX,
  convertToEG,
  convertToArray,
  verifySentence
}