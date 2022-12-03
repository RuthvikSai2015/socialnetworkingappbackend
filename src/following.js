const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Profiles = require('../src/model/data').Profiles;
const Users = require('../src/model/data').Users
const thisLoginUser = require('./auth');


function getFollowing(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find({ username: user }).exec(function (err, items) {
        if (items.length == 1) {
            items.forEach(item => {
                return res.status(200).send({ username: item.username, followers: item.followers });
            })
        } else {
            return res.status(200).send({ notfound: "nofollowersexist" });
        }
    })

}

function putFollowing(req, res) {
    let username = req.username;
    let newFollowers = req.params.user;
    let followers = [];
    if (newFollowers === username) {
        return res.status(200).send({ result: "you cannot follow yourself" });
    }
    let flag = 0;
    Profiles.find({ username: newFollowers }).exec(function (err, items2) {
        if (items2.length === 0 || !items2) {
            flag = 1;
            return res.status(200).send({ result: "the follow user do not exist" })

        }
        Profiles.find({ username: username, followers: newFollowers }).exec(function (err, result) {
            if (result.length > 0 || !result) {
                flag = 1;
                return res.status(200).send({ result: "the user already exist as follower" })
            }
        })
        Profiles.find({ username: username }).exec(function (err, items3) {
            followers = items3[0].followers
            followers.push(newFollowers)
            Profiles.updateOne({ username: username }, { $set: { followers: followers } }, function (err, items) {
                return res.status(200).send({ username: username, following: followers })
            })
        })
    })
}

function deleteFollowing(req, res) {
    let username = req.username;
    let newFollowers = req.params.user;
    let followers = [];
    Profiles.find({ username: username }).exec(function (err, items) {
        followers = items[0].followers;
        const index = followers.indexOf(newFollowers);
        if (index > -1) {
            followers.splice(index, 1);
        }
        Profiles.updateOne({ username: username }, { $set: { followers: followers } }, function (err, items) {
           return res.status(200).send({ username: username, followers: followers });
        })
    })

}

module.exports = (app) => {
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.get('/following/:user?', getFollowing);
    app.put('/following/:user?', putFollowing);
    app.delete('/following/:user', deleteFollowing);
}
