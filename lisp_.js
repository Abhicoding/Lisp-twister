const atomParser = factoryParser([numParser, boolParser, stringParser, exprParser])		//, exprParser

function factoryParser (args) {
  return function (input) {
    for (let x of args) {
      if (x(input)) {
        return x
      }
    }
    return null
  }
}

function numParser (input) {				// parses numbers
  let reg = /^(\-?\d+(\.\d+)?([eE][+-]?\d+)?)/, parseOut = input.match(reg)
  if (parseOut) {
    return [Number(parseOut[0]), input.slice(parseOut[0].length)]
  }
  return null
}

function boolParser (input) {				// parses booleans
  if (input.substr(0, 2) === '#t') {
    return [true, input.substr(2)]
  } else if (input.substr(0, 2) === '#f') {
    return [false, input.substr(2)]
  }
  return null
}

function stringParser (input) {				// parses strings
  let reg = /^\'\S+/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0].slice(1), input.slice(parseOut[0].length)]
  }
  return null
}

function spaceParser (input) {			// parses spaces
  let reg = /^\s+/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0].slice(1), input.slice(parseOut[0].length)]
  }
  return null
}

const lib = { '+': (array) => { return array.reduce((a, b) => a + b) },
  '-': (array) => { return array.reduce((a, b) => a - b) },
  '*': (array) => { return array.reduce((a, b) => a * b) },
  '/': (array) => { return array.reduce((a, b) => a / b) },
  '>': (array) => { return array.reduce((a, b) => a > b) },
  '<': (array) => { return array.reduce((a, b) => a < b) },
  '>=': (array) => { return array.reduce((a, b) => a >= b) },
  '<=': (array) => { return array.reduce((a, b) => a <= b) },
  '=': (array) => { return array.reduce((a, b) => a == b) },
  'equal?': (array) => { return array.reduce((a, b) => a == b) },
  'abs': (a) => {
    if (a.length == 1) {
      return Math.abs(a)
    } else { throw new Error('Wrong number of arguments. Need exactly 1') }
  },
  'max': (array) => { return Math.max.apply(null, array.map(Number)) },
  'min': (array) => { return Math.min.apply(null, array.map(Number)) },
  'begin': (array) => { return array.pop() },
  'print': (array) => { return console.log(array.join('')) },
  'if': (array) => {
    if (array[0] === true) {
      return array[1]
    }
    return array[2]
  },
  'define': (array) => {
    if (array.length === 1) {
      return userdef[array[0]] = undefined
    }
    return userdef[array[0]] = array[1]
  },
  'lambda': (array) => {}
}

const userdef = {}

function exprParser (input) {  // parses Expressions
  if (input[0] === '(') {
    input = input.substr(1)
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
    }
    let reg = /\S+/
    let ops = input.match(reg)[0]
    input = input.substr(ops.length)
    if (ops in lib) {
      let arr = [], res1
      while (input[0] !== ')' && input.length !== 0) {
        if (spaceParser(input)) {
          input = spaceParser(input)[1]
        	continue
        }
        if (atomParser(input) !== null) {
	        res = atomParser(input)(input)
	        arr.push(res[0])
	        input = res[1]
      	}
      }
      return [evaluator(ops, arr), input.substr(1)]
    } return null
    ops = input[0]
  } return null
}

console.log(exprParser('(if #f (* 2 3) (+ 4 1))'))

function evaluator (ops, array) {  // (operation , [arguments+])
  return lib[ops](array)
}

// console.log(exprParser('(+ abcd$  (- asd) sac) 123'))
