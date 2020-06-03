var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var commentSchema = new Schema ({
comment: { type: String, required: true},
user: { type: String, required: true},
created_at: Date,
thread_id : { type: String, required: true},}
);

commentSchema.pre('save', function(next) {
  var comment = this;

  if (!this.created_at) this.created_at = new Date();
next();
});

module.exports = mongoose.model('Comment', commentSchema)
