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
  let noCommentSource = source.replace(/(\/\/.*?[\n\r])|(\/\*[\S\s]*?\*\/)/g, '')
  let noCommentSourceCopy = noCommentSource

  // 1. 找到route开始和结尾的位置，将开始搜索的位置设为起始位置
  // 2. 用两个栈，一个大括号栈，一个方括号栈，方括号为空时才处理大括号逻辑，否则直接跳过（跳过对子路由的处理）
  // 3. 方括号为空，遇到大括号开头，入栈
  // 4. 方括号为空，遇到大括号结尾，判读是否是路由对象，如果是，获取path首字，执行路由判断逻辑
  // 5. 方括号不空，不论大括号开头结尾，全都跳过
  // 6. 遇到方括号开头，入栈；遇到方括号结尾，判断是否超出了匹配范围，超出则结束执行，未超出则出栈
  const matchRange = findRouteIndexRange(noCommentSource)
  const reg = /[\{\[\]\}]/g // eslint-disable-line
  let match = reg.exec(noCommentSource)
  let startMatch, endMatch
  const braceStack = [] // 大括号栈
  const bracketStack = [] // 方括号栈
  while (match) {
    switch (match[0]) {
      case '[':
        // 起始位置不入栈
        if (match.index > matchRange.start) bracketStack.push(match)
        break
      case ']':
        if (match.index >= matchRange.end) noCommentSource = ''
        else bracketStack.pop()
        break
      case '{':
        if (bracketStack.length) break // 方括号栈不为空，子路由，跳过
        braceStack.push(match)
        break
      case '}':
        if (bracketStack.length) break // 方括号栈不为空，子路由，跳过
        startMatch = braceStack.pop()
        endMatch = match
        const subStr = noCommentSource.substring(startMatch.index, endMatch.index + 1)
        const pathMatch = subStr.match(/path\s*?:[\S\s]+?,/g)
        const componentMatch = subStr.match(/component\s*?:[\S\s]+?,/g)
        // make sure that the matched string has path and component
        if (pathMatch && componentMatch) {
          const firstWordOfPath = subStr.match(/path\s*?:\s*?['"]\/(\S*?)['"/]/)[1]
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

function findRouteIndexRange(source) {
  // 找到路由下标范围，返回一个包含开始和结束位置的对象，没有匹配则返回null
  const reg = /\[(\s*?\{[\S\s]*path:[\S\s]+\},?\s*?){1,}\]/
  const matchInfo = source.match(reg)
  if (!matchInfo) return null
  const matchedStrLength = matchInfo[0].length
  const start = matchInfo.index
  const end = matchInfo.index + matchedStrLength - 1
  return { start, end }
}
