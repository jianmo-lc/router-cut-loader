const loaderUtils = require('loader-utils')
const getOptions = loaderUtils.getOptions

module.exports = function loader(source) {
  const options = getOptions(this)
  if (!options) return source
  const allLoad = !!options.all
  const include = options.include
  if (allLoad) return source
  if (!include || (include && !include.length)) {
    throw new Error('router-cut-loader options require a none empty "include" array if "all" set to false.')
  }
  // delete comments
  const noCommentSource = source.replace(/(\/\/.*?[\n\r])|(\/\*[\S\s]*?\*\/)/g, '')
  let noCommentSourceCopy = noCommentSource

  const reg = /[\{\}]/g // eslint-disable-line
  let match = reg.exec(noCommentSource)
  let startMatch, endMatch
  const stack = []
  while (match) {
    switch (match[0]) {
      case '{':
        stack.push(match)
        break
      case '}':
        startMatch = stack.pop()
        endMatch = match
        const subStr = noCommentSource.substring(startMatch.index, endMatch.index + 1)
        const pathMatch = subStr.match(/path\s*?:[\S\s]+?,/g)
        const componentMatch = subStr.match(/component\s*?:[\S\s]+?,/g)
        // make sure that the matched string has and only has one path and one component
        if ((pathMatch && pathMatch.length === 1) && (componentMatch && componentMatch.length === 1)) {
          const firstWordOfPath = subStr.match(/path\s*?:\s+?['"]\/(\S+?)['"\\/]/)[1]
          // delete the router configuration if the first word of the path do not exist in "include" list
          if (!include.includes(firstWordOfPath)) {
            noCommentSourceCopy = noCommentSourceCopy.replace(subStr, '')
          }
        }
        break
    }
    match = reg.exec(noCommentSource)
  }
  return noCommentSourceCopy
}
