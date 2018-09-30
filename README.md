## install

`
  npm install --save-dev router-cut-loader
`

## Usage
webpack.config.js

``` js
module.exports = {
  module: {
    rules: [
      {
        test: ,
        use: {
          loader: path.resolve(__dirname, '../webpackLoader/cutRouterConfig.js'),
          options: {
            all: false/true,
            include: [
              // first word in router path
              // ex: { path: '/detail/:id', component: '...' }
              // if you want to load this component, you should have "detail" written here
            ]
          }
        }
      }
    ]
  }
}
```
## options

name|type|default|description
:---:|:--:|:---:|:---
all|Boolean|true|load all router components or not, if set to true, the include config below will be ignored
include|Array of string|[]|the item of the array if the first word of router path, if all is set to true, this will be ignored

## notice

Be aware that this loader is only aimed at improving development efficiency, so use this loader only in development environment.