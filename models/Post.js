var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

//this is where we declare the variables for the database
var postSchema = new Schema ({
titlename: { type: String, required: true},
content: { type: String, required: true},
user: { type: String, required: true},
created_at: Date
});

postSchema.pre('save', function(next) {
  var post = this;

  if (!this.created_at) this.created_at = new Date();
next();
});

module.exports = mongoose.model('Post', postSchema)
