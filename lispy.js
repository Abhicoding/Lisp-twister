// Lisp interpreter project 22/01/2018 13:15

function parseSomething (input) {
  if (input[0] === '(') {
    let parseOut = [], x
    input = input.substr(1)
    while (input[0] !== ')') {
      if (parseSpace(input) !== null) {
        input = parseSpace(input)[1]
      }
      // console.log(parseOut)
      if (input[0] === '(') {
        let result = parseSomething(input)
        result = evaluator(result)
        parseOut.push(String(result[0]))
        input = result[1]
        continue
      }
      parseOut.push(input[0])
      input = input.substr(1)
    }
    return [parseOut, input.substr(1)]
  }
  return null
}

function evaluator (input) {  // [operator, arguments*]
  let temp = input[0].slice(2), result = input[0][1]
  for (let x of temp) {
    result += ' ' + input[0][0] + ' ' + x
  }
  result
  return [eval(result), input[1]]
}

function parseSpace (input) {
  let reg = /^(\s+)/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0], input.substring(parseOut[0].length)]
  }
  return null
}

console.log(evaluator(parseSomething('(+ 1 (* 2 (+ 1 3)))')))
