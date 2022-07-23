function load(source) {
  console.log("loader 2 ......");
  return source + "//loader2";
}
module.exports = load;
