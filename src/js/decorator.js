function readonly(target, key, decorator) {
  // 属性不可重写
  decorator.writable = false;
}

class Number {
  @readonly
  PI = 3.14;
}

const n = new Number();
console.log(n.PI);
n.PI = 22; // 属性不可重写了
console.log(n.PI);
