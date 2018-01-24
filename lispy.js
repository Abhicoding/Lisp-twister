// Lisp interpreter project 22/01/2018 13:15
function parseAble (input) {
  input = input.replace(/\(/g, ' ( ')
  input = input.replace(/\)/g, ' ) ')
  input = input.split(' ')
  input = input.filter(function (item) { return item !== ' ' && item !== '' })
  return input
}

const env = {'+': (array) => { return array.reduce((a, b) => Number(a) + Number(b)) },
  '-': (array) => { return array.reduce((a, b) => Number(a) - Number(b)) },
  '*': (array) => { return array.reduce((a, b) => Number(a) * Number(b)) },
  '/': (array) => { return array.reduce((a, b) => Number(a) / Number(b)) },
  '>': (array) => { return array.reduce((a, b) => Number(a) > Number(b)) },
  '<': (array) => { return array.reduce((a, b) => Number(a) < Number(b)) },
  '>=': (array) => { return array.reduce((a, b) => Number(a) >= Number(b)) },
  '<=': (array) => { return array.reduce((a, b) => Number(a) <= Number(b)) },
  '=': (array) => { return array.reduce((a, b) => Number(a) == Number(b)) },
  'abs': (a) => { return a }}

function parseLisp (input) {
  if (typeof (input) === 'string') {
    input = parseAble(input)
  }
  if (input[0] === '(' && input[input.length - 1] === ')') {
    let parseOut = [], result, ops, i = 0
    ops = input[1]
    input = input.slice(2)
    input = input.slice(0, input.length - 1)
    while (input.length !== 0) {
      if (input[0] === '(') {
        if (parseLisp(input).includes('#Error')) {
          return parseLisp(input)
        } else {
          let out = parseLisp(input)
          parseOut.push(out[0])
          input = out[1]
          continue
        }
      }
      parseOut.push(input[0])
      input = input.slice(1)
    }
    result = evaluator(ops, parseOut)
    return [result, input.slice(1)]
  }
  // return err('parenthesis')
  throw new Error('Bad/Unbalanced parenthesis in the input')
}

function evaluator (ops, array) {  // (operation , [arguments+])
  return env[ops](array)
}

console.log(parseLisp('(+ 1.6 (+ 7.8 2.3)'))
