var express = require('express');
var path = require('path');
var app = express();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user').User;
require('./config/passport')(passport, User, LocalStrategy);

var mongo = require('mongodb');
var mongoose = require('mongoose');
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/thegrandexchange';
mongoose.connect(connectionString);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('connection successful');
});

var routes = require('./routes/index');
var users = require('./routes/users');
var items = require('./routes/items');

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'asDni2324nasdSDSf',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);
app.use('/items', items);
app.use('/', routes);

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080,
  process.env.OPENSHIFT_NODEJS_IP);
