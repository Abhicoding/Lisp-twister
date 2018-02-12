// const readline = require('readline')
const interpreter = require('./lisp_.js')

const repl = require('repl')
// const { Translator } = require('translator');

// const myTranslator = new Translator('en', 'fr');

function myEval (cmd, context, filename, callback) {
  callback(null, console.log(interpreter.interpret(cmd)[0]))
}

repl.start({ prompt: '> ', eval: myEval })
