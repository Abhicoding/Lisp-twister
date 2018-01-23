// Lisp interpreter project 22/01/2018 13:15

function parseSomething (input) {

}

function parseSpace (input) {
	 let reg = /^(\s+)/, parseOut = input.match(reg)
  if (parseOut) {
    return [parseOut[0], input.substring(parseOut[0].length)]
  }
  return null
}
