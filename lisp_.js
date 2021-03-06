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

function spaceParser (input) {  // parses spaces
  let reg = /^\s+/
  if (input.match(reg) !== null) {
    return [input.match(reg)[0].slice(1), input.slice(input.match(reg)[0].length)]
  }
  return null
}

function exprParser (input) { // parses out first parenthesis before space
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
  // console.log(res2, 'lambdaParser')
  exp = res2[0]
  input = res2[1]
  return [arr, exp, input.substr(2)]
}

function update (input) { // Updates value from one dictionary into another
  return Object.assign({}, input[0], input[1])
}

function local (argument) { // Creates dictionary from two arrays
  let temp = {}
  for (let x in argument[1]) {
    temp[argument[x]] = argument[1][x]
  }
  return temp
}

const lib = { '+': array => array.reduce((a, b) => a + b), // Inbuilt function library
  '-': array => array.reduce((a, b) => a - b),
  '*': array => array.reduce((a, b) => a * b),
  '/': array => array.reduce((a, b) => a / b),
  '>': array => array.reduce((a, b) => a > b),
  '<': array => array.reduce((a, b) => a < b),
  '>=': array => array.reduce((a, b) => a >= b),
  '<=': array => array.reduce((a, b) => a <= b),
  '=': array => array.reduce((a, b) => a === b),
  'equal?': array => array.reduce((a, b) => a === b),
  'abs': (a) => {
    if (a.length === 1) {
      return Math.abs(a)
    } else { throw new Error('Wrong number of arguments. Need exactly 1') }
  },
  'max': array => Math.max(...array),
  'min': array => Math.min(...array),
  'begin': array => array.pop(),
  'print': array => console.log(array.join(''))/*,
  'quote': array => console.log(array[0]) */
}
const globalScope = lib  // Initiates globalScope environment

function lisp (input) {   // Initiates program
  // console.log(input)
  input = programParser(input)
  while (input[1]) {
    input = programParser(input[1], input[2])
  }
  return input[0]
}

function expression (input, env = globalScope) { // Expression programParseruator
  if (input[0] === '(') {
    // console.log(input, 'expression_ops')
    let reg = /\(\s*([^\(\s\)]+)\s*/
    let temp = [input.match(reg)[1], input.substr(input.match(reg)[0].length)],
      ops = temp[0]
    input = temp[1]
    // console.log(ops, '***', input, 'what is happening here')
    if (ops in env) {
      return sExpressions(ops, input, env)
    } else if (ops === 'define') {
      return defineExp(input, env)
    } else if (ops === 'lambda') {
      input = lambdaParser(input)
      return lambdaExp(input, env)
    } else if (ops === 'if') {
      return ifExp(input, env)
    } /* else if (ops === 'quote') {
      return console.log(input,,env)
    } */
  }
  return null
}

function sExpressions (ops, input, env = globalScope) { // S- expression handling
  let arr = [], temp
  while (input[0] !== ')' && input.length !== 0) {
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
    }
    temp = programParser(input, env)
    arr.push(temp[0])
    input = temp[1]
  }
  return [env[ops](arr, env), input.substr(1), env]
}

function defineExp (input, env) { // define expression handling
  let result1, result2, inner
  result1 = input.match(/^\(?\s*([^\(\s\)]+)\s*/)
  inner = local([[result1[1]], [undefined]])
  input = input.substr(result1[0].length)
  if (input[0] !== ')') {
    result2 = programParser(input)
    // console.log(result2, 'defineExp', input)
    inner[result1[1]] = result2[0]
    input = result2[1]
  }
  env = update([env, inner])
  // console.log(result2, 'defineExp', input.substr(1))
  return ['', input.substr(1), env]
}

function lambdaExp (args, env = globalScope) { // lambda expression handling
  // console.log(args[1], 'when does this run?')
  return [function (input, env = globalScope) {
    let inner = local([args[0], input])
    return programParser(args[1], update([env, inner]))[0]
  }, args[2], env]
}

function ifExp (input, env = globalScope) { // returns evaluated if expression
  let array = [], result
  while (input[0] !== ')') {
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
      continue
    }
    result = exprParser(input)
    array.push(result[0])
    input = result[1]
  }
  if (programParser(array[0], env)[0]) {
    return [programParser(array[1], env)[0], input.substr(1), env]
  }
  return [programParser(array[2], env)[0], input.substr(1), env]
}

function userDef (input, env = globalScope) { // User defined values handling
  let reg = /[^\(\s\)]+/
  // console.log(input)
  if (input.match(reg) !== null) {
    let user = input.match(reg)[0]
    input = input.substr(user.length)
    if (user in env) {
      return [env[user], input, env]
    }
  }
  return null
}

function programParser (input, env = globalScope) {   // solves everything
  let result
  // console.log('programParser', input)
  if (spaceParser(input) !== null) {
    input = spaceParser(input)[1]
  }
  if (numParser(input) !== null) {
    result = numParser(input)
  } else if (boolParser(input) !== null) {
    result = boolParser(input)
  } else if (input[0] === '(') {
    result = expression(input, env)
    env = result[2]
  } else if (userDef(input, env)) {
    result = userDef(input, env)
    env = result[2]
  }
  // console.log(result[0], 'programParser OOPS!!!')
  input = result[1]
  if (result[0] === undefined) {
    return ['', input, env]
  }
  return [result[0], input, env]
}

exports.interpret = programParser
// console.log(lisp('(- 1 3)'))
// console.log(expression('(lambda (a b c) (* 4 (+ 1 2)))')([0, 1, 2]))
// console.log(lisp('(define square (lambda (r) (* r r))) (square 7)'))
// console.log(expression('(* r r)'))
// console.log(lisp('(if (< 3 4) (+ 1 3) (* 2 3))'))
// console.log(lisp('(define fib (lambda (n) (if (< n 2) (* 1 1) (+ (fib (- n 1)) (fib (- n 2)))))) (fib 10)'))
// console.log(lisp(`(define fact (lambda (n) (if (<= n 1) (* 1 1) (* n (fact (- n 1))))))
//  (fact 50)`))
// console.log(lisp('(define twice (lambda (x) (* 2 x))) (twice 7)'))
// console.log(lambdaParser('(r) (* r r)) (+ 1 3)'))
// console.log(programParser('(begin (define r 2) (* r r))'))  //,
// console.log(programParser('(begin (define circle-area (lambda (r) (* 3.14 (* r r)))) (circle-area 2))'))
// console.log(programParser('(begin (define r 3) (* r r)'))
// console.log(lisp('(if (< 3 4) (* 1 1) (* 2 2))'))
// console.log(programParser('(+ abcd$  (- asd) sac) 123'))

// console.log(programParser('(define x 2) '))
// var envr = new scope(['a', 'b'], [1, 2], {'z': 99})
// console.log(envr.inner, envr.outer, envr.find('z'), envr.find('a'))

// console.log(lisp('(define r 10) (print r)'))
// console.log(lisp('(< 3 4 5)'))
// console.log(globalScope)
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
