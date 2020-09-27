import verifySentence, { 
  parenthesisRegex, 
  binaryRegex,
  atomicRegex
} from './verifySentence';

const operators = require('./operators.json')

/**
 * This file is responsible for holding many of the converters used throughout the 
 * app.
 */

/**
 * @param  {string} the string to add escape characters for
 * @return {string} the string with all regex-safe characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * keys represents the ASCII notation for the input characters. 
 * @type {array}
 */
let keys = Object.keys(operators.binary);
keys = keys.map(el => escapeRegExp(el));
const binarySymbReplace = new RegExp('(?:' + keys.join('|') + ')', 'g')
const unaryOperators = operators.unary

/**
 * @param  {string} Fitch-style sentence notation.
 * @return {string} TeX sentence notation.
 */
const convertToTeX = (formula) => {
  if (typeof formula === 'string' || formula instanceof String) {
    // filter out spaces
    formula = formula.replace(/\s/g, '')
    let symbol
    // replace all binary operators
    while ((symbol = binarySymbReplace.exec(formula)) !== null) {
      formula = formula.substr(0,symbol['index']) 
                    + operators.binary[symbol[0]] + ' '
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

/**
 * @param  {string} statement
 * @return {int} counts the number of unary operators in the given input.
 *
 * For example, if passed a statement !!(P | Q), we notice two unary operators 
 * encapsulating the statement (the ! symbols, representing NOT). These would 
 * be counted out.
 */
function countUnary(statement) {
  const matchesList = (val) => (op) => op === val;
  let c = 0;
  for (c in statement.split(""))
    if (!Object.keys(unaryOperators).some(matchesList(statement.charAt(c))))
      break;
  return c;
}

/**
 * @param  {string} the sentence being passed in, in Fitch-style notation.
 * @param  {bool} whether to convert the statement to EG or just return without unary.
 * @return {[type]}
 */
const stripUnary = (s, convertStatement) => {

  console.log(s)
  console.log(convertStatement)
  if (convertStatement == null) 
    convertStatement = true;
  let c = countUnary(s);
  let statement = s.substr(c)
  if (convertStatement) statement = convertToEG(statement)
  else statement = '{' + statement + '}'
  return "(".repeat(c) + statement + ")".repeat(c)
}

/**
 * @param  {string} Fitch-style sentence notation 
 * @return {string} EG-style sentence notation.
 */
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
      if (countUnary(formula) !== 0) {
        return stripUnary(formula.substr(1,formula.length-2), true);
      }
      return convertToEG(parenthesis[1]);
    } else if (unary) {
      return stripUnary(formula, false);
    } else return null;
  }
  else return null;
}

/** 
 * Given a string and the index of the open parenthesis, this
 * will return the index of the closed parenthesis
 */
const getMatchingParen = (formula, start) => {
  // hold the number of '(' minus the number of ')'
  let parens = 0
  let j = start
  while (j < formula.length) {
    if (formula[j] === '(') {
      parens++
    }
    else if (formula[j] === ')') {
      parens--
      // if parens is 0, then the current ')' matches the start parenthesis
      if (parens === 0)
        return j
    }
    j++
  }
}

/**  
 * Converts a string representing an Existential Graph into
 * a nested array. Acts recursively, calling iteslf again
 * When a pair of parentehses are found. If given an index i,
 * this will start from that index.
 * 
 * For example: 
 * "((({P})){Q}{R}){P}" => [ [ [['P']],'Q','R' ],'P' ]
 */
const convertToArray = (formula, i = 0) => {
  if (typeof formula === 'string' || formula instanceof String) {
    // hold the array of the current level that will be returned
    let arr = []
    // loop through the string
    while (i < formula.length) {
      // if closing parenthesis, return the array for this subexpression
      if (formula[i] === '(') {
        // find the matching pair of parentheses of the subexpression
        let j = getMatchingParen(formula, i)
        // push the subexpression into the array
        let subExp = formula.substr(i+1, j-1)
        if (subExp)
          arr.push(convertToArray(formula.substr(i+1, j-1)))
        i = j
      }
      // if a variable is found, push it to the array
      else if (formula[i] === '{') {
        let text = formula[++i];
        if (text === '}') arr.push('\u00A0')
        else arr.push(text)
        i++
      }
      i++
    }
    // return the array that values the current expression
    return arr
  }
  else return null
}

/**
 * Export all converters
 */
export {
  convertToTeX,
  convertToEG,
  convertToArray,
  verifySentence
}