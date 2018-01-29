// Lisp interpreter project 22/01/2018 13:15
function parseAble (input) {
  input = input.replace(/\(/g, ' ( ')
  input = input.replace(/\)/g, ' ) ')
  input = input.split(' ')
  input = input.filter(function (item) { return (!(item.match(/\s+/)) && item !== '') })
  return input
}

const lib = {'mathops': { '+': (array) => { return array.reduce((a, b) => Number(a) + Number(b)) },
  '-': (array) => { return array.reduce((a, b) => Number(a) - Number(b)) },
  '*': (array) => { return array.reduce((a, b) => Number(a) * Number(b)) },
  '/': (array) => { return array.reduce((a, b) => Number(a) / Number(b)) },
  '>': (array) => { return array.reduce((a, b) => Number(a) > Number(b)) },
  '<': (array) => { return array.reduce((a, b) => Number(a) < Number(b)) },
  '>=': (array) => { return array.reduce((a, b) => Number(a) >= Number(b)) },
  '<=': (array) => { return array.reduce((a, b) => Number(a) <= Number(b)) },
  '=': (array) => { return array.reduce((a, b) => Number(a) == Number(b)) },
  'equal?': (array) => { return array.reduce((a, b) => Number(a) == Number(b)) },
  'abs': (a) => {
    if (a.length == 1) {
      return Math.abs(a)
    } else { throw new Error('Wrong number of arguments. Need exactly 1') }
  },
  'max': (array) => { return Math.max.apply(null, array.map(Number)) },
  'min': (array) => { return Math.min.apply(null, array.map(Number)) }},
  'begin': (array) => { return array.pop() },
  'print': (array) => { return console.log(array.join('')) },
  'if': (array) => {
    if (array[0] === true) {
      return array[1]
    }
    return array[2]
  },
  'define': (array) => {
    if (array[0] in lib) {
      throw new Error('Keyword is being overwritten')
    } else {
      userdef[array[0]] = array[1]
      return userdef[array[0]]
    }
  }
}

const userdef = {}

function parseLisp (input) {    // (lisp expression in string)
  if (typeof (input) === 'string') {
    input = parseAble(input)
  }
  if (input[0] === '(' && input[input.length - 1] === ')') {
    let parseOut = [], result, ops, i = 0
    ops = input[1]
    input = input.slice(2)
    while (input.length !== 0 && input[0] !== ')') {
      if (input[0] === '(') {       // Encounter Lisp Expression
        let out = parseLisp(input)
        parseOut.push(out[0])
        input = out[1]
        continue
      }
      parseOut.push(input[0])
      input = input.slice(1)
    }
    if (input.length === 0) {
      throw new Error('Bad/Unbalanced parenthesis in the input')
    }
    result = evaluator(ops, parseOut)
    return [result, input.slice(1)]
  }
  throw new Error('Bad/Unbalanced parenthesis in the input')
}

function evaluator (ops, array) {  // (operation , [arguments+])
  if (ops in lib['mathops']) {
    for (let x of array) {
      if (isNaN(Number(x))) {
        console.log('Error: execute: unbound symbol: ' + x + ' []')
        throw new Error()
      }
    }
    return lib['mathops'][ops](array)
  }
  return lib[ops](array)
}

// exports.interpret = parseLisp
console.log(parseLisp('(+ 1 2)'))
// console.log(parseLisp('(if (> (* 11 11) 120) 1 0)'))
