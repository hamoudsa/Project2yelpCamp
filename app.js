const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const mustacheExpress = require('mustache-express');
const pgp = require('pg-promise')();
var methodOverride = require('method-override');
var database = require('./db/config');

var connection = {
  host: `${database.host}`,
  user: `${database.user}`,
  password: `${database.password}`,
  database: `${database.database}`,
  ssl: database.ssl
}

const db = pgp(connection);

var app = express();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
require('./db/passport')(passport);
app.use(flash());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(methodOverride('_method'))


// Global variables

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
})

const index = require('./routes/index');
app.use('/', index);

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`connected on port ${port}`);
});
