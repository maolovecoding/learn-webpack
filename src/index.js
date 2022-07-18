// 模块懒加载
// 使用魔法注释 打包后模块文件名
import(/* webpackChunkName: "lazy" */ "./lazy1").then((module) => {
  console.log(module);
});
