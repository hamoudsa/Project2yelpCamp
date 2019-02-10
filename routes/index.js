const express = require('express');
const router = express.Router();
const async = require('async');
const passport = require('passport');
const pgp = require('pg-promise')();
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const {ensureAuthenticated} = require('../helpers/auth');
var methodOverride = require('method-override');
var database = require('../db/config');


var connection = {
  host: `${database.host}`,
  user: `${database.user}`,
  password: `${database.password}`,
  database: `${database.database}`,
  ssl: database.ssl
}

const db = pgp(connection);

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  if (!req.body.password || !req.body.username) {
    req.flash('error_msg', 'enter username and password');
    res.redirect('/login');
  } else {
    passport.authenticate('local', function (err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        req.flash('error_msg', 'wrong details');
        res.redirect('/login');
      } else {
        req.logIn(user, function (err) {
          if (err) { return next(err); }
          res.redirect('/')
        });
      }
    })(req, res, next);
  }
});

router.get('/register', (req,res) => {
  res.render('register',{
    layout: 'main'
  });
})

router.post('/register', (req, res) => {
  let errors = [];
  if (!req.body.username || req.body.username.length < 4) {
    errors.push('Username can\'t be empty or less than 4')
  }

  if (!req.body.password) {
    errors.push('Password can\'t be empty')
  }
  if (errors.length > 0) {
    res.render('register', {
      errors: errors
    })
  } else {
    db.any(`select * from users where username = '${req.body.username}'`)
      .then(user => {
        if (user.length > 0) {
          errors.push('sorry this username already exist');
          res.render('register', {
            errors: errors
          })
        } else {
          var id = Math.floor(Math.random() * Math.floor(100000000));
          var newUserMysql = new Object();

          newUserMysql.username = req.body.username;
          newUserMysql.password = req.body.password;
          newUserMysql.id = id;

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUserMysql.password, salt, (err, hash) => {
              if (err) throw err;
              newUserMysql.password = hash;
              db.none(`INSERT INTO users ( id, username, password ) values ('${id}','${req.body.username}','${newUserMysql.password}')`)
              .then(() => {
                res.redirect('login');
              })
            });
          });
        }
      })

  }
})

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/', (req, res) => {
  db.any(`select * from camps`)
  .then(camps => {
    res.render('index', {
      camps: camps
    })
  })
  
})

router.get('/addcamp',ensureAuthenticated, (req,res) => {
  res.render('addcamp');
})

router.post('/addcamp',ensureAuthenticated, (req, res) => {
  var campID = Math.floor(Math.random() * 100000000);
  db.none(`insert into camps(campid, name, imageurl, description, userid) values ( ${campID}, '${req.body.name}', '${req.body.image}', '${req.body.description}', ${req.user.id})`)
    .then(result => {
      res.redirect('/')
    })
})

router.get('/updatecamp', (req,res) => {
  db.one(`select * from camps where campid = ${req.query.id}`)
  .then(camp => {
    res.render('updatecamp', {
      camp: camp
    });
  })
})

// router.post('/updatecamp',ensureAuthenticated, (req,res) => {
//   db.none(`update camps set name = '${req.body.name}', description = '${req.body.description}' where campid = ${req.body.id}`)
//   .then(() => {
//     res.redirect(`/camp?id=${req.body.id}`)
//   })
// })

router.put('/updatecamp', (req,res) => {
  db.none(`update camps set name = '${req.body.name}', description = '${req.body.description}' where campid = ${req.query.id}`)
  .then(() => {
    res.redirect(`/camp?id=${req.body.id}`)
  })
})

router.get('/camp', (req,res) => {
  db.one(`select * from camps where campid = ${req.query.id}`)
  .then(camp => {
    res.render('camp', {
      camp: camp
    });
  })
})

router.delete('/deletecamp', (req,res) => {
  db.none(`delete from camps where campid = ${req.body.campid}`)
  .then(()=>{
    res.redirect('/');
  })
})

module.exports = router;
