const md5 = require('md5')
const cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const session = require("express-session");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Users = require('../src/model/data').Users
const redis = require('redis').createClient(
    'redis://default:dpxsg5P31GrjoPVX66jHV9GseWKUrGi4@redis-19961.c16.us-east-1-3.ec2.cloud.redislabs.com:19961');
const Profile = require('../src/model/data').Profiles
const url = require('../src/model/data').userInterface;
const router = require('express').Router();

let sessionUser = {};
let cookieKey = "sid";
let userObjs = {};
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    return res.status(400).json({ "statusCode": 400, "message": "not authenticated" })
}

function isLoggedIn(req, res, next) {

    if (!req.cookies) {
        res.sendStatus(401);
        return
    }

    let sid = req.cookies[cookieKey];
    if (!sid) {
        res.sendStatus(401);
        return
    }

    let username = undefined;
    redis.hget("temp", -1, (err, item) => {
        redis.hget("sessions", item, (err, item) => {
            username = item;
            if (username) {
                req.username = username;
                next();
            }
            else {
                res.sendStatus(401)
                return
            }
        })
    })


}

function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // supply username and password
    if (!username || !password) {
        res.sendStatus(400);
        return
    }

    Users.find({ username: username }).exec(function (err, items) {
        if (items.length === 1) {
            const user = { username: items[0].username, salt: items[0].salt, hash: items[0].hash }
            let hash = md5(user.salt + password);
            if (hash === user.hash) {
                // create session id, use sessionUser to map sid to user username

                let sid = md5(user.hash + user.salt);
                sessionUser[sid] = user.username;
                redis.hmset("sessions", sid, user.username);
                redis.hmset("temp", -1, sid);
                // Adding cookie for session id
                res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'none', secure: true });
                let msg = { username: username, result: 'success' };
                return res.send(msg);
            }
            else {
                return res.status(401);
            }
        }
        else {
            return res.status(401);
        }
    })
}

function register(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    // supply username and password
    if (!username || !password) {
        res.sendStatus(400);
        return
    }


    let salt = md5(username + new Date().getTime());
    let hash = md5(salt + password);

    userObjs[username] = { username: username, salt: salt, hash: hash }

    Users.find({ username: username }).exec(function (err, items) {
        if (items.length > 0) {
            return res.status(200).send({ result: 'Username already exist' })
        }

        if (items.length === 0) {
            new Users({
                username: username,
                salt: salt,
                hash: hash
            }).save()
            new Profile({
                username: username,
                headline: username + ' headline',
                followers: [],
                email: req.body.email,
                zipcode: req.body.zipcode,
                dob: req.body.dob,
                displayName: req.body.displayName,
                phone: req.body.phone,
                avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
            }).save()
        }
        let msg = { username: username, result: 'success' };
        return res.send(msg);
    })


}

function logout(req, res) {
    let temp = req.cookies[cookieKey];
    delete sessionUser[temp];
    res.clearCookie(cookieKey)
    return res.send({ result: 'logout success' })
}



passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: '727588815757-09osaq62tj8j7s9l2r1i8md4e646fevg.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: '/auth/google/callback',
    //callbackURL:'https://sn62-hw8-version2.surge.sh/assets/callback.html',
    //passReqToCallback   : true

},
    function (accessToken, refreshToken, profile, done) {

        //return done(null, userData);
        process.nextTick(function () {
            return done(null, profile);
        })
    })
);

function googleLogin(req, res) {
    debugger;
    if (!req.isAuthenticated()) {
        return res.sendStatus(401).json(req);

    }
    const user = req.user;
    const id = user.id;
    const username = user.name.givenName + " " + user.name.familyName;
    Users.find({ username: username }, function (err, items) {
        const item = items[0];
        if (!item) {
            let salt = md5(username + new Date().getTime());
            let hash = md5(salt + 111);
            Users.find({ username: username }).exec(function (err, items) {
                if (err) {
                    return done(err)
                }
                if (items.length === 0) {
                    new Users({
                        username: username,
                        salt: salt,
                        hash: hash
                    }).save()
                    new Profile({
                        username: username,
                        headline: username + ' initial headline',
                        followers: [],
                        email: "sn_62@rice.edu",
                        zipcode: 12345,
                        dob: new Date().getTime(),
                        displayName: username,
                        phone: "123-123-1234",
                        avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
                    }).save(function (err, result) {
                        return tempFunc(id, username, res)
                    });
                }
            })
        }
        else {
            return tempFunc(id, item.username, res);
        }
    })
}


function tempFunc(id, username, res) {


    // Bad request
    if (!username || !id) {
        return res.sendStatus(400);
    }

    Users.find({ username: username }, function (err, userObjs) {
        // Unauthorized request.
        var userObj = userObjs[0];
        if (!userObj) {
            return res.sendStatus(401);
        }

        // Success login
        let sid = md5(userObj.hash + userObj.salt);
        sessionUser[sid] = username;
        redis.hmset("sessions", sid, username);
        redis.hmset("temp", -1, sid);
        // Set cookie
        res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true ,sameSite: 'none', secure: true});
        return res.redirect(`${url}/#/main`);
    });
}

module.exports = {
    isAuthenticatedUser: function (req, res, next) {
      if (req.isAuthenticated()) {
        redis.hget("temp", -1, (err, item) => {
            redis.hget("sessions", item, (err, item) => {
                username = item;
                if (username) {
                    req.username = username;
                    return next();
                }
                else {
                    res.sendStatus(401)
                    return
                }
            })
        })
      } else {
        res.redirect('/')
      }
    },
    isGuestUser: function (req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      } else {
        res.redirect('/login');
      }
    },
  }


  router.post('/login', login);
  router.post('/register', register);
 
  router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

  router.get('/auth/google/callback',
      passport.authenticate('google', {
          failureRedirect: '/googleLogin'
      }),
      function (req, res) {
          // Authenticated successfully
          googleLogin(req, res);
          //res.redirect('/');
      });

  router.get('/googleLogin', googleLogin)
  router.use(isLoggedIn);
  router.put('/logout', logout);
module.exports = router;