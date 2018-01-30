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

const env = {'+': 'plus', '-': 'minus'}

function sPar (input) {			// parses expressions
  if (input[0] === '(') {
    let parseOut = input[0]
    input = input.substr(1)
    if (spcPar(input)) {
    	input = spcPar(input)[1]
    }
    if (input[0] in env) {
    	parseOut += input[0]
    	input = input.substr(1)
	    while (input[0] !== ')' && input.length !== 0) {
	      if (spcPar(input)) {
			    	input = spcPar(input)[1]
			    	parseOut += ' '
			    	continue
			  }
			  parseOut += input[0]
		  	input = input.substr(1)
	    }
		  parseOut += input[0]
		  input = input.substr(1)
		  return [parseOut, input]
  	} return null
  }
}

// console.log(spcPar('(+ abcd$) 123'))
