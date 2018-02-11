const readline = require('readline')
const interpreter = require('./lisp_.js')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('lisp>> ', (answer) => {
  // TODO: Log the answer in a database
  console.log(`${interpreter.interpret(answer)}`)
  rl.close()
})
