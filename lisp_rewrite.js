const atomParser = factoryParser([numPar, booPar, strPar])		//, exPar

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

function numPar (input) {				// parses numbers
  let reg = /^(\-?\d+(\.\d+)?([eE][+-]?\d+)?)/, parseOut = input.match(reg)
  if (parseOut) {
    return [Number(parseOut[0]), input.slice(parseOut[0].length)]
  }
  return null
}

function booPar (input) {				// parses booleans
  if (input.substr(0, 2) === '#t') {
    return [true, input.substr(2)]
  } else if (input.substr(0, 2) === '#f') {
    return [false, input.substr(2)]
  }
  return null
}

function strPar (input) {				// parses strings
  let reg = /^\'\S+/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0].slice(1), input.slice(parseOut[0].length)]
  }
  return null
}

function spcPar (input) {			// parses spaces
  let reg = /^\s+/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0].slice(1), input.slice(parseOut[0].length)]
  }
  return null
}

const lib = { '+': (array) => { return array.reduce((a, b) => a + b) },
  '-': (array) => { return array.reduce((a, b) => Number(a) - Number(b)) },
  '*': (array) => { return array.reduce((a, b) => Number(a) * Number(b)) },
  '/': (array) => { return array.reduce((a, b) => Number(a) / Number(b)) },
  '>': (array) => { return array.reduce((a, b) => a > b) },
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

// const env = {'+': 'plus', '-': 'minus'}
/*
function sPar (input) {			// parses expressions
  if (input[0] === '(') {
    let parseOut = input[0]
    input = input.substr(1)
    if (spcPar(input)) {
    	input = spcPar(input)[1]
	    if (input[0] in env) {
	    	parseOut += input[0]
	    	input = input.substr(1)
		    while (input[0] !== ')' && input.length !== 0) {
		      if (spcPar(input)) {
				    input = spcPar(input)[1]
				    parseOut += ' '
				    continue
				  }
				  if (input[0] === '(') {
				  	if (sPar(input)) {
				  		let x = sPar(input)
				  		parseOut += x[0]
				  		input = x[1]
				  		continue
				  	} return null
				  }
				  parseOut += input[0]
			  	input = input.substr(1)
		    }
			  parseOut += input[0]
			  input = input.substr(1)
			  return [parseOut, input]
    	} return null
  	} return null
  } return null
} */

function exPar (input) {
  if (input[0] === '(') {
    input = input.substr(1)
    if (spcPar(input)) {
      input = spcPar(input)[1]
    }
    let reg = /\S+/
    let ops = input.match(reg)
    input = input.substr(ops.length)
    if (ops in lib) {
      let arr = [], res
      while (input[0] !== ')' && input.length !== 0) {
        if (spcPar(input)) {
          input = spcPar(input)[1]
        }
        res = atomParser(input)(input)
        arr.push(res[0])
        input = res[1]
      }
      return evaluator(ops, arr)
    } return null
    ops = input[0]
  } return null
}

console.log(exPar('(> 1 2'))

function evaluator (ops, array) {  // (operation , [arguments+])
  return lib[ops](array)
}

// console.log(exPar('(+ abcd$  (- asd) sac) 123'))
