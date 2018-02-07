const atomParser = factoryParser([numParser, boolParser, stringParser, expression, userDef])

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

function exprParser (input) { // parses out string upto maximum balanced parenthesis
  if (input[0] === '(') {
    let parseOut = input[0]
    input = input.substr(1)
    while (input[0] !== ')') {
      if (input[0] === '(') {
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

function lambdaParser (input) {  // parses and returns arguments for defining lambda
  let arr = [], res1, res2, exp
  input = input.substr(1)
  while (input[0] !== ')') {
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
    }
    let reg1 = /[^\s+/)]/
    res1 = input.match(reg1)
    arr.push(res1[0])
    input = input.substr(res1[0].length)
  }
  input = input.substr(1)
  if (spaceParser(input)) {
    input = spaceParser(input)[1]
  }
  res2 = exprParser(input)
  exp = res2[0]
  input = res2[1]
  return [arr, exp, input]
}

class scope {
  constructor (args, values, outer = lib) {
    this.args = args
    this.values = values
    this.outer = outer
  }
  get inner () {
    let j = Math.min(this.args.length, this.values.length), contain = {}
    for (let i = 0; i < j; i++) {
      contain[this.args[i]] = this.values[i]
    }
    return Object.assign(contain, this.outer)
  }
  find (input) {
    if (input in this.inner) {
      return this.inner[input]
    } else if (input in this.outer) {
      return this.outer[input]
    }
    return null
  }
}

const lib = { '+': array => array.reduce((a, b) => a + b),
  '-': array => array.reduce((a, b) => a - b),
  '*': array => array.reduce((a, b) => a * b),
  '/': array => array.reduce((a, b) => a / b),
  '>': array => array.reduce((a, b) => a > b),
  '<': array => array.reduce((a, b) => a < b),
  '>=': array => array.reduce((a, b) => a >= b),
  '<=': array => array.reduce((a, b) => a <= b),
  '=': array => array.reduce((a, b) => a == b),
  'equal?': array => array.reduce((a, b) => a == b),
  'abs': (a) => {
    if (a.length == 1) {
      return Math.abs(a)
    } else { throw new Error('Wrong number of arguments. Need exactly 1') }
  },
  'max': array => Math.max.apply(null, array.map(Number)),
  'min': array => Math.min.apply(null, array.map(Number)),
  'begin': array => array.pop(),
  'print': array => console.log(array.join('')),
  'r': 3
  /*
  'if': array => {
    if (array[0] === true) {
      return array[1]
    }
    return array[2]
  } */
}

const global = new scope([], [], lib)

function lisp (input) {   // initiation
  console.log(input)
  return atomParser(input)(input)[0]
}

function extract (input) {
  let reg = /^\(\s*([^\(\s\)]+)\s*/
  return [input.match(reg)[1], input.substr(input.match(reg)[0].length)]
}

function expression (input, env = global) {
  if (input[0] === '(') {
    let temp = extract(input), ops = temp[0]
    input = temp[1]
    if (ops in env.inner) {
      temp = s_Expressions(ops, input, env)
      return temp
    } else if (ops === 'define') {
      temp = defineExp(input, env)
      return temp
    } else if (ops === 'lambda') {
      input = lambdaParser(input)
      temp = lambdaExp(input, env)
      return temp
    }
  }
  return null
}

// console.log(exprEval('(define x 2) '))
// var envr = new scope(['a', 'b'], [1, 2], {'z': 99})
// console.log(envr.inner, envr.outer, envr.find('z'), envr.find('a'))

// console.log(s_Expressions('(- 3 1)'))
// console.log(global)
// console.log(lisp('(begin (define r 2) (* r r))'))
// console.log(opsExtract('(define r 4)'))
// console.log(lisp('(begin (define circle-area (lambda (r) (* 3.14 (* r r)))) (* 2 3) (circle-area 3))'))
// console.log(lisp('(- 1 3)'))
// console.log(lisp('(if (> 3 4) (+ 1 2) (* 2 2))'))
// console.log(opsExtract('(> 3 4)'))
// console.log(lisp('(define)'))
// console.log(lisp('(begin (define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1)))))) (fact 1))'))
// console.log(lisp('(+)'))
// console.log(expression('(define r (+ 1 3))'))

function s_Expressions (ops, input, env = global) {
  let arr = []
  while (input[0] != ')' && input.length !== 0) {
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
    } else if (atomParser(input) !== null) {
      temp = atomParser(input)(input)
      arr.push(temp[0])
      input = temp[1]
    } else {
      return null
    }
  }
  return [env.find(ops)(arr), input.substr(1), env]
}

function defineExp (input, env) {
  let result1, result2, arr = []
  result1 = input.match(/^\(?\s*([^\(\s\)]+)\s*/)
  env[result1[0]] = undefined
  input = input.substr(result1[0].length)
  if (input[0] !== ')') {
    result2 = input.match(/(.*)\)$/)
    input = input.substr(result2[0].length)
    env[result1[0]] = atomParser(result2[1])(result2[1])[0]
  }
  return env
}

function lambdaExp (args, env = global) {
  return function (input, env = global) {
    let array = args[0], exp = args[1]
    for (x in input) {
      env[array[x]] = input[x]
    }
    return [atomParser(exp)(exp), env]
  }
}

function userDef (input, env = global) {
  let reg = /[^\(\s\)]+/
  if (input.match(reg) !== null) {
    user = input.match(reg)[0]
    input = input.substr(user.length)
    if (env.find(user) !== null) {
      return [env.find(user), input, env]
    }
  }
  return null
}

function eval (input, env = global) {
  let result, array
  if (numParser(input) !== null) {
    result = numParser(input)
  } else if (boolParser(input) !== null) {
    result = boolParser(input)
  } else if (expression(input, env) !== null) {
    result = expression(input)
    env = result[2]
  } else if (userDef(input)) {
    result = userDef(input)
    env = result[2]
  }
  input = result[1]
  if (input === '') {
    return [result[0], input, env]
  }
  return eval(input, env)
}

console.log(eval('(+ r 2)'))
// console.log(userDef(''))

// console.log(expression('(lambda (a b c) (* 4 (+ 1 2)))')([0, 1, 2]))
// console.log(expression('(* r r)', global))
// console.log(expression('(define r 4)', global))
