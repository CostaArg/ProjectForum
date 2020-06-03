var express = require('express');
var mongoose = require('mongoose');
var pug = require('pug');
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt')

var User = require('./models/User');
var Post = require('./models/Post');

var app = express();

var db = mongoose.connect('mongodb://localhost:27017/forum');
var session = require('express-session')

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'whatever',
  resave: false,
  saveUninitialized: true,
}));

app.get('/', function(request, response) {
  response.render('index', {title: 'home', temp: 8});
});

app.get('/login', function(request, response) {
  response.render('login', {title: 'login'});
});

app.get('/post', function(request, response) {
  response.render('post', {title: 'post'});
});

app.post('/login', function(request, response) {

  User.findOne({'username': request.body.username}, function(err, user) {

    if (err) return response.render('error', {error: err, title: 'error'});
    if (!user) return response.render('error'), {error: 'user does not exist'}
	bcrypt.compare(request.body.password, user.password, function(err, res) {
		if(res){
		  request.session.user = user
		  request.session.save();

		  response.redirect('/me')
		} else {
		  return response.render('error', {error: 'incorrect credentials', title: 'error'});
		}
		});
	});
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

  app.post('/createPost', function(request, response) {
    if (request.body.titlename && request.body.content) {
      // create post
      Post.create({
        titlename: request.body.titlename,
        content: request.body.content
      }, function(error, user) {
        if (error) {
          response.render('error', {
            title: 'error',
            error: 'post was not created'
          });
        } else {
          response.send(titlename);
        }
      });
    } else {
      response.render('error', {
        title: 'error',
        error: 'titlename or content required'
      });
    }
  });

  app.get('/createPost', function(request, response) {
    response.render('createPost', {title: 'Post Creation'});
  });

  //routes
  app.get('/me', authenticated, function(request, response) {
    response.send(request.session.user);
  });

app.listen(6969);
