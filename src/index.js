const loaderUtils = require('loader-utils')
const getOptions = loaderUtils.getOptions

module.exports = function loader(source) {
  const options = getOptions(this)
  if (!options) return source
  const allLoad = !!options.all
  const include = options.include
  if (allLoad) return source
  if (!include || (include && !include.length)) {
    throw new Error('router-cut-loader options require a none empty "include" array if "all" set to true.')
  }
  // delete comments
  const noCommentSource = source.replace(/(\/\/.*?[\n\r])|(\/\*[\S\s]*?\*\/)/g, '')
  // delete router object NOT exists in "include" array in options
  const reformedSource = noCommentSource.replace(
    /,*\s*?\{\s*?path\s*?:[\S\s]+?,\s*?component\s*?:[\S\s]+?,\s*?(meta\s*?:\s*?\{[\S\s]*?\})?\s*?\}/g,
    (str) => {
      const matched = str.match(/path\s*?:\s+?['"]\/(\S+?)['"\\/]/)
      if (!matched) return str
      const pathname = matched[1]
      if (include.includes(pathname)) return str
      return ''
    }
  )
  return reformedSource
}
