const fs = require('fs')
const loaderUtils = require('loader-utils')

const startTime = +new Date()
const getOptions = loaderUtils.getOptions

module.exports = function loader(source) {
  const options = getOptions(this)
  if (!options) return source
  const allLoad = !!options.all
  const include = options.include
  const printPath = options.printPath
  const showTimeCost = options.showTimeCost
  if (allLoad) return source
  if (!include || (include && !include.length)) {
    throw new Error('router-cut-loader options require a none empty "include" array if "all" set to false.')
  }
  // delete comments
  let noCommentSource = source.replace(/(\/\/.*?[\n\r])|(\/\*[\S\s]*?\*\/)/g, '')
  let noCommentSourceCopy = noCommentSource

  // 找到路由配置数组在整个代码文件中的起始位置和结束位置
  const matchRange = findRouteIndexRange(noCommentSource)
  const reg = /[\{\[\]\}]/g // eslint-disable-line
  let match = reg.exec(noCommentSource)
  let startMatch, endMatch
  const braceStack = [] // 大括号栈
  const bracketStack = [] // 方括号栈
  while (match) {
    switch (match[0]) {
      case '[':
        // 括号位置小于起始位置不入栈
        if (match.index > matchRange.start) bracketStack.push(match)
        break
      case ']':
        if (match.index >= matchRange.end) noCommentSource = '' // 配置超出结束位置，结束循环
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
  if (printPath) {
    fs.writeFile(printPath, noCommentSourceCopy, (err) => {
      const message = err || `Router configuration after shifting has been written to file ${printPath}`
      console.log('router-cut-loader: ', message)
    })
  }
  const endTime = +new Date()
  if (showTimeCost) console.log(`router-cut-loader time cost: ${endTime - startTime}ms`)
  return noCommentSourceCopy
}

function findRouteIndexRange(source) {
  // 找到路由数组下标范围，返回一个包含开始和结束位置的对象，没有匹配则返回null
  const reg = /\[(\s*?\{[\S\s]*path:[\S\s]+\},?\s*?){1,}\]/
  const matchInfo = source.match(reg)
  if (!matchInfo) return null
  const matchedStrLength = matchInfo[0].length
  const start = matchInfo.index
  const end = matchInfo.index + matchedStrLength - 1
  return { start, end }
}
