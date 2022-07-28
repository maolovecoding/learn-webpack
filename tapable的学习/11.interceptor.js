const { SyncHook } = require("../tapable");

const hook = new SyncHook(["name", "age"]);
// 注册拦截器
hook.intercept({
  // 当你触发一个新的回调的时候会触发 可以修改tapInfo的内容
  register(tapInfo) {
    console.log("拦截器1开始 register");
    return tapInfo;
  },
  // 每次执行事件函数都会触发
  tap(tapInfo) {
    console.log("拦截器1的tap");
  },
  // 执行第一个事件函数前触发
  call(name, age) {
    console.log("拦截器1的call：", name, age);
  },
});
hook.tap("1", (name, age) => {
  console.log("-----------------", 1, name, age);
});
hook.tap("2", (name, age) => {
  console.log("-----------------", 2, name, age);
});
hook.call("zs", 22);
