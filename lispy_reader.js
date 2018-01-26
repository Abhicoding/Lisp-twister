const interpreter = require('./lispy.js')

const fs = require('fs')

fs.readFile('./test/test.ss', 'utf-8', (err, data) => {
  if (err) throw err
  console.log(interpreter.interpret(data))
})
