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
  let reg = /^\s+/
  if (input.match(reg) !== null) {
    return [input.match(reg)[0].slice(1), input.slice(input.match(reg)[0].length)]
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
  // console.log(input, 'yoyo')
  res2 = exprParser(input)
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
  '=': array => array.reduce((a, b) => a == b),
  'equal?': array => array.reduce((a, b) => a == b),
  'abs': (a) => {
    if (a.length == 1) {
      return Math.abs(a)
    } else { throw new Error('Wrong number of arguments. Need exactly 1') }
  },
  'max': array => Math.max(...array),
  'min': array => Math.min(...array),
  'begin': array => array.pop(),
  'print': array => console.log(array.join(''))/*,
  'r': 4 */
}
const global = lib
// const global = new scope([], [], lib) // Initiates global environment

function lisp (input) {   // initiation
  input = evaluate(input)
  while (input[1] !== '') {
    let result = evaluate(input[1], input[2])
    input = result[1]
  }
  return result[0]
}

function expression (input, env = global) { // Expression evaluateuator
  if (input[0] === '(') {
    let reg = /\(\s*([^\(\s\)]+)\s*/
    let temp = [input.match(reg)[1], input.substr(input.match(reg)[0].length)],
      ops = temp[0]
    input = temp[1]
    if (ops in env) {
      // console.log(s_Expressions(ops, input, env)[0], 'in expression')
      return s_Expressions(ops, input, env)
    } else if (ops === 'define') {
      return defineExp(input, env)
    } else if (ops === 'lambda') {
      input = lambdaParser(input)
      // console.log(lambdaExp(input, env)([2]))
      return lambdaExp(input, env)
    }
  }
  return null
}

function s_Expressions (ops, input, env = global) { // S- expression handling
  let arr = []
  while (input[0] != ')' && input.length !== 0) {
    if (spaceParser(input)) {
      input = spaceParser(input)[1]
    }
    temp = evaluate(input, env)
    arr.push(temp[0])
    input = temp[1]
  }
  return [env[ops](arr), input.substr(1), env]
}

function defineExp (input, env) { // define expression handling
  let result1, result2, arr = [], inner
  result1 = input.match(/^\(?\s*([^\(\s\)]+)\s*/)
  inner = local([[result1[1]], [undefined]])
  input = input.substr(result1[0].length)
  if (input[0] !== ')') {
    result2 = evaluate(input)
    inner[result1[1]] = result2[0]
    input = result2[1]
  }
  env = update([env, inner])
  // inner['square']([10])
  // console.log(inner[result1[1]], 'checking square')
  return ['', input, env]
}

function lambdaExp (args, env = global) { // lambda expression handling
  // console.log(args, 'let\'s go')
  return [function (input, env = global) {
    inner = local([args[0], input])
    return evaluate(args[1], update([env, inner]))[0]
  }, args[2], env]
}

function userDef (input, env = global) { // User defined values handling
  let reg = /[^\(\s\)]+/, arr
  // console.log(env['r'], 'in userdef', input)
  if (input.match(reg) !== null) {
    let user = input.match(reg)[0]
    input = input.substr(user.length)
    if (user in env) {
      return [env[user], input, env]
    }
  }
  return null
}
/*
function userHelp (input, env = global) {

} */

function evaluate (input, env = global) {   // solves everything
  let result
  console.log(input, 'in_evaluate')
  if (spaceParser(input) !== null) {
    input = spaceParser(input)[1]
  }
  if (numParser(input) !== null) {
    result = numParser(input)
  } else if (boolParser(input) !== null) {
    result = boolParser(input)
  } else if (expression(input, env) !== null) {
    result = expression(input, env)
    env = result[2]
  } else if (userDef(input, env)) {
    result = userDef(input, env)
    env = result[2]
  }
  console.log(result[0], "what's going out")
  input = result[1]
  return [result[0], input, env]
}
// console.log(evaluate('( + 1 3)'))
// console.log(expression('(lambda (a b c) (* 4 (+ 1 2)))')([0, 1, 2]))
console.log(lisp('(define square (lambda (r) (* r r))) (square 3)'))
// console.log(expression('(* r r)'))
// console.log(lisp('(max 1 2 3)'))
// console.log(evaluate('(+ 4 5 6)'))
// console.log(lambdaParser('(r) (* r r)) (+ 1 3)'))
// console.log(exprevaluate('(begin (define r 2) (* r r))'))  //,
// console.log(exprevaluate('(begin (define circle-area (lambda (r) (* 3.14 (* r r)))) (circle-area 2))'))
// console.log(exprevaluate('(begin (define r 3) (* r r)'))
// console.log(exprevaluate('(if (> 3 4) (+ 1 2) (* 2 2))'))
// console.log(exprevaluate('(+ abcd$  (- asd) sac) 123'))

// console.log(exprevaluate('(define x 2) '))
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
