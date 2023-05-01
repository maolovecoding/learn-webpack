const less = require('less')
module.exports = function lessLoader(source){
  const callback = this.async()
  less.render(source, {
    filename: this.resource, 
  }, (err, output) => {
    callback(err, output.css)
  })
}