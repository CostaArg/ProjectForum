var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var postSchema = new Schema ({
titlename: { type: String, required: true},
content: { type: String, required: true},
created_at: Date
});

postSchema.pre('save', function(next) {
  var post = this;

  if (!this.created_at) this.created_at = new Date();

});

postSchema.methods.compare = function(pw) {
  return bcrypt.compareSync(pw, this.password)
}

module.exports = mongoose.model('Post', postSchema)
