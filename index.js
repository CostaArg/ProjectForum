var express = require('express');
var mongoose = require('mongoose');
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
	Post.find({}, function(err, postsList) {
		response.render('index', {title: 'home', posts: JSON.stringify(postsList)});
    });
});

app.get('/login', function(request, response) {
  response.render('login', {title: 'login'});
});

app.get('/logout', function(request, response) {
  if request.session.user {
    request.session.destroy();
    response.render('logout', {title: 'logout'});
  } else {
    response.render('error'), {error: 'You are already logged out'}
  }
});


app.get('/post', function(request, response) {
	Post.findOne({'_id':request.query.id}, function(err, post){
		if(!err){
			response.render('post', {title: post.titlename, data:post.content, user:post.user, time:post.created_at.toUTCString()});
		}
		else{
			response.render('error', {error: err, title: 'error'});
		}
		});
});

app.post('/login', function(request, response) {

  User.findOne({'username': request.body.username}, function(err, user) {

    if (err) return response.render('error', {error: err, title: 'error'});
    if (!user) return response.render('error'), {error: 'User does not exist'}
	bcrypt.compare(request.body.password, user.password, function(err, res) {
		if(res){
		  request.session.user = user
		  request.session.save();

		  response.redirect('/')
		} else {
		  return response.render('error', {error: 'Incorrect credentials', title: 'error'});
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
          error: 'User was not created'
        });
      } else {
        response.send(user);
      }
    });
  } else {
    response.render('error', {
      title: 'error',
      error: 'Username or password required'
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
    if (request.session.user) {
      if (request.body.titlename && request.body.content) {
        // create post
        Post.create({
          titlename: request.body.titlename,
          content: request.body.content,
  		user: request.session.user.username
        }, function(error, user) {
          if (error) {
            response.render('error', {
              title: 'error',
              error: 'Post was not created'
            });
          } else {
            response.send("CREATED");
          }
        });
      } else {
        response.render('error', {
          title: 'error',
          error: 'Titlename or content required'
        });
      }
    } else {
        response.render('error', {
          title: 'error',
          error: 'You are not logged in'
        });
      }
    });

  app.get('/createPost', function(request, response) {
    if (request.session.user) {
		response.render('createPost', {title: 'Post Creation'});
	}
	else{
		 response.render('error', {
          title: 'error',
          error: 'You are not logged in'
        });
	}
  });

app.listen(6969);
