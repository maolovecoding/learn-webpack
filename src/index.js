// import { flatten, concat } from 'lodash'
// // 按需加载插件会转为
// // import flatten from 'lodash/flatten'

// console.log(flatten([1,[2,3]]))
// console.log(concat([1,2], [3], [4]))

// const tt = require('./1.batest')
// console.log(tt)
// const t = require('./title')
// console.log(t)

const sum = (a,b) => a+b

// setTimeout(()=>{
//   import(
//     /* webpackPreload: true */
//   /* webpackChunkName: "preload" */'./preload').then(res => console.log(res))
// }, 1000)

setTimeout(()=>{
  import(
    /* webpackPrefetch: true */
  /* webpackChunkName: "preload" */'./preload').then(res => console.log(res))
}, 1000)