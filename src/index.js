const loaderUtils = require('loader-utils')
const getOptions = loaderUtils.getOptions

module.exports = function loader(source) {
  const options = getOptions(this)
  if (!options) return source
  const allLoad = !!options.all
  const include = options.include
  if (allLoad) return source
  // 去掉注释
  const noCommentSource = source.replace(/(\/\/.*?[\n\r])|(\/\*[\S\s]*?\*\/)/g, '')
  // 删掉无用路由
  const reformedSource = noCommentSource.replace(
    /,\s*?\{\s*?path\s*?:[\S\s]+?,\s*?component\s*?:[\S\s]+?,\s*?(meta\s*?:\s*?\{[\S\s]*?\})?\s*?\}/g,
    (str) => {
      const matched = str.match(/path\s*?:\s+?['"]\/(\S+?)['"\n\r\\/]/)
      if (!matched) return str
      const pathname = matched[1]
      if (include.includes(pathname)) return str
      return ''
    }
  )
  return reformedSource
}