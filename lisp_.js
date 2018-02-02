const atomParser = factoryParser([numParser, boolParser, stringParser, exprEval])

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

function numParser (input) {  // parses numbers
  let reg = /^(\-?\d+(\.\d+)?([eE][+-]?\d+)?)/, parseOut = input.match(reg)
  if (parseOut) {
    return [Number(parseOut[0]), input.slice(parseOut[0].length)]
  }
  return null
}

function boolParser (input) {  // parses booleans
  if (input.substr(0, 2) === '#t') {
    return [true, input.substr(2)]
  } else if (input.substr(0, 2) === '#f') {
    return [false, input.substr(2)]
  }
  return null
}

function stringParser (input) {  // parses strings
  let reg = /^\'\S+/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0].slice(1), input.slice(parseOut[0].length)]
  }
  return null
}

function spaceParser (input) {  // parses spaces
  let reg = /^\s+/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0].slice(1), input.slice(parseOut[0].length)]
  }
  return null
}

function exprParser(input){
  if (input[0] === '('){
    let parseOut = input[0]
    input = input.substr(1)
    while (input[0] !== ')'){
      if (input[0] === '('){
        let res = exprParser(input)
        parseOut += res[0]
        input = res[1]
        continue
      }
      parseOut += input[0]
      input = input.substr(1)
    }
    parseOut += input[0]
    return [parseOut, input.substr(1)]
  } return null
}

function lambdaParser(input) {  //parses and returns arguments for defining lambda
  let arr=[], res1, res2, exp
  input= input.substr(1)
  while(input[0] !== ')'){
    if(spaceParser(input)){
      input = spaceParser(input)[1]
    }
    let reg1 = /[^\s+/)]/
    res1 = input.match(reg1)
    arr.push(res1[0])
    input= input.substr(res1[0].length)
  }
  input = input.substr(1)
  if(spaceParser(input)){
    input = spaceParser(input)[1]
  }
  res2 = exprParser(input)
  exp = res2[0]
  input = res2[1]
  //console.log([arr, exp, input], '###')
  return [arr, exp, input]
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
      userdef[array[0]] = undefined
    }
    userdef[array[0]] = array[1]
  },
  'lambda': (array) => {return function(input) {
    for (let i in array[0]){
      userdef[array[0][i]] = input[i]
    }
    console.log(array[0], '***')
    return exprEval(array[1])
  }
}}

const userdef = {}

function exprEval (input) {  // parses Expressions
  //console.log(input)
  if (input[0] === '(') {
    input = input.substr(1)
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
    }
    let reg = /^[^)\s]+/
    let ops = input.match(reg)[0]
    input = input.substr(ops.length)
    if (ops in lib || ops in userdef) {
      let arr = [], res
      while (input[0] !== ')' && input.length !== 0) {
        //console.log(ops, "^", arr, "^",input)
        if (spaceParser(input)) {
          input = spaceParser(input)[1]
          continue
        }
        if (ops === 'lambda'){
           let out = lambdaParser(input)
           arr = arr.concat(out.slice(0, 2))
           input = out[2]
           //console.log(arr.concat(out.slice(0, 2)), "arrarrarr", input)
           continue
        }
        if (atomParser(input) !== null) {
          res = atomParser(input)(input)
          arr.push(res[0])
          input = res[1]
          continue
        }
        let varName = input.match(reg)[0]
        input = input.substr(varName.length)
        if (varName in userdef) {
          arr.push(userdef[varName])
          continue
        }
        if(ops === 'define'){
          arr.push(varName)
          continue
        }  
      }
      console.log(ops, arr, "here") 
      return [eval(ops, arr), input.substr(1)]
    } return null
  } return null
}


function eval (ops, array) {  // (operation , [arguments+])
  console.log(ops, array, "$")
  if (ops in userdef){
    return userdef[ops](array)
  }
  return lib[ops](array)
}

class scope {
  constructor (args, values, outer = lib){
    this.args = args
    this.values = values
    this.outer = outer
    let j = Math.min(args.length, values.length), contain = {}

    for (let i = 0; i < j ; i++){
      contain[args[i]] = values[i]
    }
    this.inner = Object.assign(outer, contain)
  }
}

var env = new scope(['a', 'b'], [1], lib)
console.log(env.inner)
//console.log(exprParser('(1 2 3 (4 5 6))'))

//console.log(exprEval('(begin (define r 2) (* r r))'))  //, 
//console.log(exprEval('(begin (define circle-area (lambda (r) (* 3.14 (* r r)))) (circle-area 2))'))
// console.log(exprEval('(begin (define r 3) (* r r)'))
// console.log(exprEval('(+ 1 3)'))
// console.log(exprEval('(if (> 3 4) (+ 1 2) (* 2 2))'))
// console.log(exprEval('(+ abcd$  (- asd) sac) 123'))
