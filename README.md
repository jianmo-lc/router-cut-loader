## Aim of the loader
Let's say you have a vue project with router configuration bellow:
```js
  [
    {
      path: '/module_1/page_1',
      component: component_11
    },
    {
      path: '/module_1/page_2',
      component: component_12
    },
    ...
    {
      path: '/module_1/page_n',
      component: component_1n
    },
    {
      path: '/module_2/page_1',
      component: component_21
    }
    {
      path: '/module_2/page_2',
      component: component_22
    },
    ...
    {
      path: '/module_2/page_n',
      component: component_2n
    }
  ]
```
You are now working on 'module_1', but every time you want to re-build the project in development, you have to re-bulid the 'module_2' as well, which wastes a lot of time. So we want to eliminate modules we don't care right now in development. This loader can help you with loader options bellow:
```js
  options: {
    all: false,
    include: [
      'module_1'
    ]
  }
```
With the configuation, the loader will retain the router object whose path starts with 'module_1', and ignore the rest as if they never exist. Obviously, the lesser router object, the shorter time cost in building.


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
include|Array of string|[]|the item of the array is the first word of router path, if all is set to true, this will be ignored

## notice

1. Be aware that this loader is only aimed at improving development efficiency, so use this loader only in development environment.
