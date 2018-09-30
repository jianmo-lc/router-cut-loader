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
        test: /file\/to\/process/,
        loader: 'router-cut-loader',
        options: {
          all: false, // false or true
          include: [
            // first word in router path
            // ex: { path: '/detail/:id', component: '...' }
            // if you want to load this component, you should have "detail" written here
          ]
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

1. Be aware that this loader is only aimed at improving development efficiency, so use this loader only in development environment.
2. The loader only works with specific router configuration style as showing below:
```js
  {
    path: '/path/url',
    component: '...', // Pages components
    meta: {
      // if you want to take some extra information along with router configuration, put them here.
      // meta is not required.
    }
  }
```