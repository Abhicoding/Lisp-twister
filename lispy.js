// Lisp interpreter project 22/01/2018 13:15
function parseAble (input) {
  input = input.replace(/\(/g, ' ( ')
  input = input.replace(/\)/g, ' ) ')
  input = input.split(' ')
  input = input.filter(function (item) { return item !== ' ' && item !== '' })
  return input
}

const env = {'+': plus (a, b) => { return a + b }}
console.log(env['+']plus (1, 2))

function parseLisp (input) {
  if (input[0] === '(') {
    let parseOut = [], x
    input = input.slice(1)
    while (input[0] !== ')') {
      if (input[0] === '(') {
        let result = parseLisp(input)
        parseOut.push(result[0])
        input = result[1]
        continue
      }
      parseOut.push(input[0])
      input = input.slice(1)
    }
    x = [parseOut, input.slice(1)]
    return x
  }
  return null
}

function evaluator (input) {  // [operator, arguments*]
  let temp = input.slice(1), result = input[1]
  for (let x of temp) {
    result += ' ' + input[0] + ' ' + x
  }
  result
  return [eval(result)]
}

function parseSpace (input) {
  let reg = /^(\s+)/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0], input.substring(parseOut[0].length)]
  }
  return null
}

// console.log(parseAble('(+ (* 3 2)  1 ) abcd'))
