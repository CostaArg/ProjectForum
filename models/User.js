var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var userSchema = new Schema ({
username: { type: String, required: true, unique: true},
password: { type: String, required: true},
created_at: Date
});

userSchema.pre('save', function(next) {
  var user = this;

  if (!this.created_at) this.created_at = new Date();

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password,salt, function(e, hash) {
      user.password = hash;

      next();
    });
  });
});

userSchema.methods.compare = function(pw) {
  return bcrypt.compareSync(pw, this.password)
}

module.exports = mongoose.model('User', userSchema)
