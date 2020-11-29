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

const wrapVarsTeX = (formula) => {
  if (typeof formula === 'string' || formula instanceof String) {
    function consume(c) {
      if (formula.length > 0 && c === formula[0]) {
        formula = formula.substring(1);
        return true;
      }
      return false;
    }

    function parseId() {
      let str = "{"
      while (formula.length > 0 
        && formula[0] !== '(' 
        && formula[0] !== ')') {

        str += formula[0]
        consume(formula[0])
      }
      return str + "}";
    }

    function parseExpression() {
      let str = ""
      while (true) {
        if (consume('(')) {
          str += "("
          let newExpr = parseExpression()
          str += newExpr
          if (newExpr === "")
            str += "{}"
          if (!consume(')')) 
            return null;
          str += ")"
        } else if (formula[0] !== ")") {
          str += parseId()
        } else break;
        if (formula.length === 0) {
          break;
        }
      }
      return str;
    }

    return parseExpression();
  }
  else return null
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
  if (convertStatement == null) 
    convertStatement = true;
  let c = countUnary(s);
  console.log(c)
  console.log(s)
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
  if (!verifySentence(formula)) return null;
  if ((typeof formula === 'string' || formula instanceof String) && verifySentence(formula)) {
    // filter out spaces
    formula = formula.replace(/\s/g, '')
    let binary = binaryRegex.exec(formula)
    let parenthesis = parenthesisRegex.exec(formula)
    let atom = atomicRegex.exec(formula)
    if (binary) {
      let left = convertToEG(binary[1])
      let right = convertToEG(binary[4])
      let symConversion = operators.eg[binary[3]];
      return symConversion.replace(/\$1/g, left).replace(/\$2/g, right)
    } else if (formula[0] === '(') {
      let res = convertToEG(formula.substr(1,formula.length-2));
      if (res) return res;
      else return null;
    } else if (Object.keys(unaryOperators).includes(formula[0])) {
      let res = convertToEG(formula.substr(1))
      if (res) return '(' + res + ')';
      else return null;
    } else if (atom) {
      return '{' + atom[0] + '}'
    }
    return null;
  } else return null;
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
const convertToArray = (formula) => {
  if (typeof formula === 'string' || formula instanceof String) {
    // hold the array of the current level that will be returned
    function consume(c) {
      if (formula.length > 0 && c === formula[0]) {
        formula = formula.substring(1);
        return true;
      }
      return false;
    }

    function parseExpression(expr) {
      let arr = []
      while (true) {
        if (consume('(')) {
          arr.push(parseExpression(formula));
          if (!consume(')')) 
            return null;
        } else if (consume('{')) {
          let st = "";
          while (formula.length > 0 && !consume('}')) {
            st = st.concat(formula[0]);
            formula = formula.substring(1);
          }
          if (st.length === 0) arr.push('\u00A0');
          arr.push(st);
          
        }
        if (formula.length === 0 || (formula[0] !== '(' && formula[0] !== '{')) {
          break;
        }
      }
      return arr;
    }
    return parseExpression(formula);
  }
  else return null
}

console.log(wrapVarsTeX('(((P((Q(R)))))(T))(T)P'))

/**
 * Export all converters
 */
export {
  convertToTeX,
  convertToEG,
  convertToArray,
  wrapVarsTeX,
  verifySentence
}