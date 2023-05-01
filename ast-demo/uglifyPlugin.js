
module.exports = function uglifyPlugin(){
  return {
    visitor:{
      // 作用域节点 是一组节点的别名 函数 整个Program 类方法等
      Scopable(path, state) {
        // 获取作用域绑定
        Object.entries(path.scope.bindings).forEach(([key, binding])=>{
          // 在当前作用域中生成一个不重复的变量名
          const newName = path.scope.generateUid()
          // isReactElement => 随机不重复的新变量名 _temp
          binding.path.scope.rename(key, newName)
        })
      }
    }
  }
}