const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const pgp = require('pg-promise')();
var database = require('./config');


var connection = {
    host: `${database.host}`,
    user: `${database.user}`,
    password: `${database.password}`,
    database: `${database.database}`,
    ssl: database.ssl
  }

const db = pgp(connection);

module.exports = function (passport) {
    passport.use(
        new localStrategy(
            {
                usernameField: 'username',
                passwordField: 'password'
            }, (username, password, done) => {
                // Match user
                db.any(`select * from users where username = '${username}'`)
                    .then(user => {
                        if (user.length < 1) {
                            return done();
                        }
                        if (user[0].password) {
                            bcrypt.compare(password, user[0].password, (err, isMatch) => {
                                if (err) console.log(err);
                                if (isMatch) {
                                    var newUserMysql = new Object();

                                    newUserMysql.username = user[0].username;
                                    newUserMysql.id = user[0].id;
                                    newUserMysql.password = user[0].password;
                                    return done(null, newUserMysql);
                                } else {
                                    return done(null, false, { message: 'Password Incorrect' });
                                }
                            })
                        } else {
                            return done(null, false, { message: 'Password Incorrect' });
                        }
                    })
            })

    );
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        db.one(`select * from users where id = ${id}`)
        .then(user => {
            done(null,user)
        })
    });
}
