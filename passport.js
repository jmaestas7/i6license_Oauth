//passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var database = require('./Database/database');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


database.connection.query('USE vidyawxx_build2');

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    database.connection.query("SELECT * FROM core_user WHERE userId = " + id, function (err, rows) {
        done(err, rows[0]);
    });
});


// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    appData: {
        "error": 1,
        "data": ""
    },
    userData: {
        login: 'login',
        // password: req.body.password,
        // firstName: req.body.firstName,
        // lastName: req.body.lastName,
        email: 'password',
    },
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
    function (login, password, res) {
        database.connection.getConnection(function (err, connection) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Internal Server Error";
                res.status(500).json(appData);
            } else {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                connection.query("SELECT * FROM core_user WHERE = ?", [login], function (err, rows) {
                    console.log(rows);
                    console.log("above row object");
                    if (err) {
                        appData["data"] = "Error Occured!";
                        res.status(400).json(appData);
                    }
                    if (rows.length) {
                        appData["data"] = "Usrname is already taken";
                        res.status(400).json(appData);
                    } else {
                        // if there is no user with that email
                        // create the user
                        var newUserMysql = new Object();

                        newUserMysql.login = login;
                        newUserMysql.password = password; // use the generateHash function in our user model

                        var insertQuery = "INSERT INTO core_users ( login, password ) values ('" + login + "','" + password + "')";
                        console.log(insertQuery);
                        connection.query(insertQuery, function (err, rows) {
                            newUserMysql.id = rows.insertId;

                            appData.error = 0;
                            appData["data"] = "User registered successfully!";
                            res.status(201).json(appData);
                        });
                    }
                });
            }
        });
    }
));


// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with login
    appData: {},
    usernameField: 'login',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
    function (login, password, res) { // callback with email and password from our form
        database.connection.getConnection(function (err, connection) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Internal Server Error";
                res.status(500).json(appData);
            } else {
                connection.query("SELECT * FROM core_users WHERE login = '" + login + "'", function (err, rows) {
                    if (err) {
                        appData.error = 1;
                        appData["data"] = "Error Occured!";
                        res.status(400).json(appData);
                    } else {
                        if (rows.length > 0) {
                            if (rows[0].password == password) {
                                var user = JSON.stringify(rows[0]);
                                console.log(user);
                                //With RSA SHA256 cert
                                // var token = jwt.sign(user, cert, { algorithm: 'RS256' }, function(err, token) {
                                //     if(err) console.log(err);
                                //     console.log(token);
                                //   });
                                var token = jwt.sign(user, process.env.SECRET_KEY);
                                console.log(token);
                                appData.error = 0;
                                appData["token"] = token;
                                res.status(200).json(appData);
                            } else {
                                appData.error = 1;
                                appData["data"] = "Login and Password does not match";
                                res.status(204).json(appData);
                                console.log(appData);
                            }
                        } else {
                            appData.error = 1;
                            appData["data"] = "Email does not exists!";
                            res.status(204).json(appData);
                        }
                    }
                });
            }
        });
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'your_jwt_secret'
},
function (jwtPayload, cb) {

    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return UserModel.findOneById(jwtPayload.id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
}
));


// expose this function to our app using module.exports
module.exports = passport;