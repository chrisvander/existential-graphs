/* 
 * Return a boolean indicating if the inputted sentence is 
 * a correctly formatted. Utilizes a recursive technique,
 * evaluating each sentence as though it were an atomic
 * sentence or any phi and psi combined with a binary 
 * operator. 
*/

const { binary, unary } = require('./operators.json')

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function arrToRegex(arr) {
  arr = arr.map(el => escapeRegExp(el));
  return '(?:' + arr.join('|') + ')'
} 

const uReg = arrToRegex(Object.keys(unary));
const regexStr = `^(${uReg}*[A-Za-z]+|${uReg}*\\((.*)\\))(${arrToRegex(Object.keys(binary))})(${uReg}*[A-Za-z]+|${uReg}*\\((.*)\\))$`
let binaryRegex = new RegExp(regexStr) // eslint-disable-line
let atomicRegex = new RegExp(`^([A-Za-z])*`)
let parenthesisRegex = new RegExp(`^${uReg}*\\((.*)\\)$`)

function verifyRecursive(sentence) {
  console.log(sentence)
  let res
  if (sentence.match(atomicRegex)) return true;
  else if ((res = binaryRegex.exec(sentence)) !== null) {
    if (res == null) return false;
    if (res[2] && res[5]) 
      return verifyRecursive(res[2]) && verifyRecursive(res[5]);
    else if (res[2]) 
      return verifyRecursive(res[2]);
    else if (res[5]) 
      return verifyRecursive(res[5]);
    else return true;
  } else if ((res = parenthesisRegex.exec(sentence)) !== null)
    return verifyRecursive(res[1])
}

export {
  binaryRegex,
  atomicRegex,
  parenthesisRegex
}

export default (sentence) => {
  // filter out spaces
  sentence = sentence.replace(/\s/g, '')
  return verifyRecursive(sentence);
}