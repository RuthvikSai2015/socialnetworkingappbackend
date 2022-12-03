const mongoose = require('mongoose');
const uiUrl = "https://sn62-hw8-version5.surge.sh";
//const uiUrl = "http://localhost:4200";
const url = "mongodb+srv://saranabiya:admin@cluster0.hdz40ci.mongodb.net/social?retryWrites=true&w=majority";
mongoose.connect(url);
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + url)
})
const profileSchema = new mongoose.Schema({
    username: String,
    headline: String,
    phone: String,
    displayName: String,
    followers: [],
    email: String,
    zipcode: String,
    dob: String,
    avatar: String
})

const articleSchema = new mongoose.Schema({
    author: {
        type: String,
        required: [true, 'author is required']
    },
    text: {
        type: String,
        required: [true, 'text is required']
    },
    date: {
        type: Date,
        required: [true, 'date is required']
    },
    url: {
        type: String,
        required: [true, 'url is required']
    },
    comments: []
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    salt: {
        type: String,
        required: [true, 'salt is required']
    },
    hash: {
        type: String,
       required: [true, 'hash is required']
    }
})

exports.userInterface = uiUrl;
exports.Profiles = mongoose.model('profiles',profileSchema)
exports.Articles = mongoose.model('articles',articleSchema)
exports.Users = mongoose.model('users',userSchema)
