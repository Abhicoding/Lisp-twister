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

function exprParser(input){ //parses out string upto maximum balanced parenthesis
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
  return [arr, exp, input]
}

class scope {
  constructor (args, values, outer = lib){
    this.args = args
    this.values = values
    this.outer = outer
    
  }
  get inner(){
    let j = Math.min(this.args.length, this.values.length), contain = {}
    for (let i = 0; i < j ; i++){
      contain[this.args[i]] = this.values[i]
    }
    return Object.assign(contain, this.outer)
  }
  find(input){
    if(input in this.inner){
      return this.inner[input]
    }
    return this.outer[input]
  }
}

const lib = { '+': array => array.reduce((a, b) => a + b) ,
  '-': array =>  array.reduce((a, b) => a - b) ,
  '*': array =>  array.reduce((a, b) => a * b) ,
  '/': array => array.reduce((a, b) => a / b) ,
  '>': array => array.reduce((a, b) => a > b) ,
  '<': array => array.reduce((a, b) => a < b) ,
  '>=': array => array.reduce((a, b) => a >= b) ,
  '<=': array => array.reduce((a, b) => a <= b) ,
  '=': array => array.reduce((a, b) => a == b) ,
  'equal?': array => array.reduce((a, b) => a == b),
  'abs': (a) => {
    if (a.length == 1) {
      return Math.abs(a)
    } else { throw new Error('Wrong number of arguments. Need exactly 1') }
  },
  'max': array => Math.max.apply(null, array.map(Number)) ,
  'min': array => Math.min.apply(null, array.map(Number)) ,
  'begin': array => array.pop() ,
  'print': array => console.log(array.join('')) ,
  'if': array => {
    if (array[0] === true) {
      return array[1]
    }
    return array[2]
  },
  'define': (array, env) => {
    let local = new scope ([array[0]], [array[1]], env)
    console.log(array, "inside")
    if (array.length === 1) {
      local.inner[array[0]] = undefined
      return local
    }
    local[array[0]] = array[1]
    return local
  },
  'lambda': array => function(input) {
    for (let i in array[0]){
      userdef[array[0][i]] = input[i]
    }
    return exprEval(array[1])[0]
  }
}

const global = new scope([], [], lib)
//const userdef = {}

function exprEval (input, env = global) {  // parses Expressions
  if (input[0] === '(') {
    input = input.substr(1)
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
    }
    let reg = /^[^)\s]+/
    let ops = input.match(reg)[0]
    input = input.substr(ops.length)
    if (ops in env.inner || ops in env.outer) {
      let arr = [], res
      while (input[0] !== ')' && input.length !== 0) {
        if (spaceParser(input)) {
          input = spaceParser(input)[1]
          continue
        }
        if (ops === 'lambda'){
           let out = lambdaParser(input)
           arr = arr.concat(out.slice(0, 2))
           input = out[2]
           continue
        }
        if (atomParser(input) !== null) {
          res = atomParser(input)(input)
          //console.log(res, arr, '***')
          arr.push(res[0])
          input = res[1]
          continue
        }
        let varName = input.match(reg)[0]
        input = input.substr(varName.length)
        arr.push(env.find(varName))
        if(ops === 'define'){
          arr.push(varName)
          continue
        }  
      }
      //console.log([eval(ops, arr, env), input.substr(1)])
      return [eval(ops, arr, env), input.substr(1), env]
    } 
    return null
  } 
  return null
}
/*
function eval (ops, array) {  // (operation , [arguments+])
  if (ops in userdef){
    return userdef[ops](array)
  }
  return lib[ops](array)
}*/

function eval (ops, array, env) {  // (operation , [arguments+])
    if (['define', 'lambda'].includes(ops)){
      console.log(array, "here")
      return env.find(ops)(array, env)
    }
    return env.find(ops)(array)
}

function lisp(input){   // initiation
  console.log(input)
  return atomParser(input)(input)[0]
}


//console.log(exprEval('(define x 2) '))
//var envr = new scope(['a', 'b'], [1, 2], {'z': 99})
//console.log(envr.inner, envr.outer, envr.find('z'), envr.find('a'))

//console.log(exprEval('(+ 3 4)'))
//console.log(exprParser('(1 2 3 (4 5 6))'))
//console.log(global)
console.log(lisp('(begin (define r 2) (* r r))')) 
//console.log(lisp('(begin (define r 4) (* r r)'))
//console.log(lisp('(begin (define circle-area (lambda (r) (* 3.14 (* r r)))) (* 2 3) (circle-area 3))'))
//console.log(lisp('(- 1 3)'))
//console.log(lisp('(if (> 3 4) (+ 1 2) (* 2 2))'))
//console.log(opsExtract('(> 3 4)'))
//console.log(lisp('(define)'))
//console.log(lisp('(begin (define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1)))))) (fact 1))'))
//console.log(lisp('(+)'))





/*
function expressionS (input) {
  if (input[0] === '(') {
    let res = opsExtract(input), arr = []
    let ops = res[0]
    if (!(['define', 'lambda']).includes(ops)){
      input = res[1]
      while (input[0] != ')' && input.length !== 0){
        if (spaceParser(input)){
          input = spaceParser(input)[1]
        }
        if (varName in env.inner) {
          arr.push(env.inner[varName])
          continue
        }
        res = atomParser(input)(input)
        arr.push(res[0])
        input = res[1]
      } 
      return [eval(ops, arr, env), input.substr(1), env]
    }
    return null
  } 
  return null
}

function specialExp(input, env) {
  if (input[0] === '(') {
    let res = opsExtract(input), arr = []
    let ops = res[0]
    if (['define', 'lambda'].includes(ops)){
      input = res[1]
      while (input !== ')' && input.length !== 0){
        if (spaceParser(input)){
          input = spaceParser(input)[1]
        }
        if (ops === 'lambda'){
             let out = lambdaParser(input)
             arr = arr.concat(out.slice(0, 2))
             input = out[2]
        }
        let varName = input.match(reg)[0]
        input = input.substr(varName.length)
        arr.push(env.find(varName))
        if(ops === 'define'){
          arr.push(varName)
          continue
        }
      } 
      return [eval(ops, arr, env), input.substr(1), env]
    }
    return null
  } 
}
*/

