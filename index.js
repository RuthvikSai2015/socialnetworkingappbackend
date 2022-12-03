const cors = require('cors');
const url = require('./src/model/data').userInterface;
const corsOptions ={
    origin:`${url}`, 
    credentials:true          
}

const auth = require('./src/auth');
const articles = require('./src/articles');
const following = require('./src/following');
const profile = require('./src/profile');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectionString = "mongodb+srv://saranabiya:admin@cluster0.hdz40ci.mongodb.net/social?retryWrites=true&w=majority";

const app = express();
var hateoasLinker = require('express-hateoas-links');
const session = require("express-session");
const MongoStore = require('connect-mongo');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
//app.get('/', hello);
//app.post('/users/:uname', addUser);
app.use(hateoasLinker);

app.use(session({
    secret: '$3cr3tK3y',
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    store: MongoStore.create({
      mongoUrl: connectionString,
      touchAfter: 24 * 3600 // time period in seconds
    })
  }));

//auth(app);
app.use(require('./src/auth'));
articles(app);
//profile(app);
app.use(require('./src/profile'));
following(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
     const addr = server.address();
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
});

