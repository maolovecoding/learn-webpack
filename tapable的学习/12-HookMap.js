const { SyncHook, HookMap, AsyncParallelHook } = require("../tapable");

const keyedHookMap = new HookMap(() => new SyncHook(["name"]));
keyedHookMap
  .for("key1")
  .tap("plugin1", (name) => console.log(name, "---------"));
keyedHookMap
  .for("key1")
  .tap("plugin2", (name) => console.log(name, "---------"));
keyedHookMap
  .for("key2")
  .tap("plugin1", (name) => console.log(name, "---------"));
keyedHookMap
  .for("key2")
  .tap("plugin2", (name) => console.log(name, "---------"));

keyedHookMap.for("key1").call("zs");
keyedHookMap.for("key2").call("ls");

const keyedHookMap2 = new HookMap(() => new AsyncParallelHook(["name"]));
console.time("async");
keyedHookMap2.for("key3").tapAsync("plugin1", (name, next) => {
  setTimeout(() => {
    console.log(name, "---------");
    next();
  }, 1000);
});
keyedHookMap2.for("key3").tapAsync("plugin2", (name, next) => {
  setTimeout(() => {
    console.log(name, "---------");
    next();
  }, 2000);
});
keyedHookMap2.for("key3").tapAsync("plugin3", (name, next) => {
  setTimeout(() => {
    console.log(name, "---------");
    next();
    console.timeEnd("async");
  }, 3000);
});

keyedHookMap2.for("key3").callAsync("zs", (err) => {
  console.log(err);
});
