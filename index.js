var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt')

var User = require('./models/User');
var comment = require('./models/comment');
var Post = require('./models/Post');

var app = express();

//var db = mongoose.connect('mongodb://localhost:27017/forum');
var db = mongoose.connect('mongodb://kostas123:testarw123@ds137441.mlab.com:37441/forum');
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
	Post.find({}, function(err, postsList, commentList) {
		response.render('index', {title: 'home', posts: JSON.stringify(postsList)});
    });
});

app.get('/login', function(request, response) {
  if (request.session.user) {
    response.render('error', {
      title: 'error',
      error: 'You are already logged in'
    });
  } else {
  response.render('login', {title: 'login'});
}});

app.get('/logout', function(request, response) {
  if (request.session.user) {
    request.session.destroy();
    response.render('logout', {title: 'logout'});
  } else {
    response.render('error', {
        title: 'error',
        error: 'You are already logged out'
    })
  }});

app.get('/post', function(request, response) {
  	Post.findOne({'_id': request.query.id}, function(err, post){
  		if(!err){
			comment.find({'thread_id': request.query.id}, function(err, commentList){
				response.render('post', {comments: JSON.stringify(commentList), thread_id: request.query.id, title: post.titlename, data: post.content, user: post.user, time: post.created_at.toUTCString()});
			});
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
      response.redirect('/');
		} else {
		  return response.render('error', {error: 'Incorrect credentials', title: 'error'});
		}
		});
	});
});

app.post('/register', function(request, response) {
  if (request.body.username && request.body.password) {
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
          response.redirect('/');
      }
    });
  } else {
    response.render('error', {
      title: 'error',
      error: 'Username or password required'
    });
  }
});

app.get('/register', function(request, response) {
  response.render('register', {title: 'register'});
});

app.post('/createPost', function(request, response) {
    if (request.session.user) {
      if (request.body.titlename && request.body.content) {
        Post.create({
          titlename: request.body.titlename,
          content: request.body.content,
  		    user: request.session.user.username
        }, function(error, post) {
          if (error) {
            response.render('error', {
              title: 'error',
              error: 'Post was not created'
            });
          } else {
            response.redirect( '/post?id=' + post._id)
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

app.post('/comment', function(request, response) {
        if (request.session.user) {
          if (request.body.comment) {
            comment.create({
              comment: request.body.comment,
      		    user: request.session.user.username,
              thread_id: request.body.thread_id
            }, function(error, comment) {
              if (error) {
                response.render('error', {
                  title: 'error',
                  error: 'comment was not created'
                });
              } else {
				response.redirect( '/post?id=' + comment.thread_id);
              }
            });
          } else {
            response.render('error', {
              title: 'error',
              error: 'Text required'
            });
          }
        } else {
            response.render('error', {
              title: 'error',
              error: 'You are not logged in'
            });
          }
        });

app.listen(6969);
