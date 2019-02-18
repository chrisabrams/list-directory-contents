const fs = require('fs')
const minimatch = require('minimatch')
const p = require('path')

type TPatternMatch = (path: string, stats: any) => boolean

function patternMatcher(pattern: string): TPatternMatch  {

  return function(path: string, stats: any): boolean {

    const minimatcher = new minimatch.Minimatch(pattern, {matchBase: true})

    return (!minimatcher.negate || stats.isFile()) && minimatcher.match(path)

  }
}

function toMatcherFunction(ignoreEntry: string): TPatternMatch {

  if (typeof ignoreEntry == 'function') {
    return ignoreEntry
  } else {
    return patternMatcher(ignoreEntry)
  }

}

function readdir(path: string, ignores: Array<string> = []) {
  
  const _ignores = ignores.map(toMatcherFunction)

  let list: Array<string> = []
  
  const files = fs.readdirSync(path)
  
  if (!files.length) {
    return list
  }

  files.forEach(function (file: string) {
    const filePath = p.join(path, file)
    const stats = fs.statSync(filePath)
    
    if (_ignores.some(function (matcher) { return matcher(filePath, stats) })) {
      return
    }
    
    if (stats.isDirectory()) {
      list = list.concat(readdir(filePath, ignores))
    } else {
      list.push(filePath)
    }
  })

  return list

}

module.exports = readdir
