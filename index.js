var express = require('express');
var mongoose = require('mongoose');
var pug = require('pug');
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt')

var User = require('./models/User');

var app = express();

var db = mongoose.connect('mongodb://localhost:27017/forum');


app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.render('index', {title: 'home'});
});

app.get('/login', function(request, response) {
  response.render('login', {title: 'login'});
});

app.post('/login', function(request, response) {
  User.findOne({username: request.body.username}), function(err, user) {
    if (err) return response.render('error', {error: err, title: 'error'});
    if (!user) return response.render('error'), {error: 'user does not exist'}

    if (user.compare(request.body.password)) {
      request.session.user = user
      request.session.save();

      response.redirect('/me')
    } else {
      return response.render('error', {error: 'incorrect credentials', title: 'error'});
    }
  };
});

app.post('/register', function(request, response) {
  if (request.body.username && request.body.password) {
    // register
    User.create({
      username: request.body.username,
      password: request.body.password
    }, function(error, user) {
      if (error) {
        response.render('error', {
          title: 'error',
          error: 'user was not created'
        });
      } else {
        response.send(user);
      }
    });
  } else {
    response.render('error', {
      title: 'error',
      error: 'username or password required'
    });
  }
});

app.get('/users.json', function(request, response) {
  User.find({}, function(err, users) {
    if (err) throw err;

    response.send(users);
  });
});

app.get('/register', function(request, response) {
  response.render('register', {title: 'register'});
});

var authenticated = function(request, response, next) {
  if (request.session && request.session.user) return next();

    return response.redirect('/login');
  }

  //routes
  app.get('/me', authenticated, function(request, response) {
    response.send(request.session.user);
  });

app.listen(6969);
