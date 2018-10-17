const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Contacts} = require('./models/contacts');
const {Friends} = require('./models/friends');
const {Abilities} = require('./models/abilities');
const {authenticate} = require('./server/authenticate');
const {findContact} = require('./server/findContact');
const {newContact} = require('./server/newContact');
const {newFriendsDetails} = require('./server/newFriendsDetails');
const {newAbilities,updateAbilities} = require('./server/addAbilities');

var app = express();
app.use(express.static(__dirname+'/static'));
app.use(bodyParser.json());
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine','hbs');

app.get('/',(req,res) => {
  res.render('index.hbs');
})

app.get('/login', (req,res) => {
  res.render('login.hbs');
})

app.get('/login/:data',(req,res) => {
  var data = JSON.parse(req.params.data);
  Friends.findByCredentials(data.phone,data.password).then((user) => {
    return user.generateAuthToken();
  })
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((e) => {
    console.log(e);
    res.status(401).send(e);
  })
})

app.get('/check',(req,res) => {
  res.render('check.hbs');
})

var removeFriends = (req,res,next) => {
  Friends.deleteMany({}).then(() => {
    next();
  });
}

app.post('/check/:data',removeFriends,(req,res) => {
  var {name,phone} = JSON.parse(req.params.data);
  findContact(name,phone)
    .then((result) => {
      console.log(result);
      return newContact(result);
    })
    .then((resultWithToken) => {
      var user = _.pick(resultWithToken, ['name','phone','tokens']);
      res.status(200).send(user);
    })
    .catch((e) => {
      console.log(e);
      if (e.code == 11000) {
        return res.status(409).send();
      }
      res.status(401).send();
    })
});

app.get('/signup/:token', authenticate, (req,res) => {
  res.render('signup.hbs',{
    name: req.user.name,
  });
})

var customAuthenticate = (req,res,next) => {
  var data = JSON.parse(req.params.data);
  req.params.token = data.token;
  req.params.data = data;
  authenticate(req,res,next);
}

app.post(`/signupData/:data`, customAuthenticate, (req,res) => {
  req.params.data.refId = req.user._id;
  newFriendsDetails(req.params.data)
    .then((user) => {
      console.log(user);
      res.status(200).send(req.user);
    })
    .catch((e) => {
      console.log(e);
      res.status(401).send(e);
    });
})

app.get('/willingness/:token', authenticate, (req,res) => {
  res.render('willingness.hbs');
})

app.post('/willingnessData/:data', customAuthenticate, (req,res) => {
  Abilities.findOne({refId: req.user._id})
    .then((user) => {
      if (!user) return newAbilities(req);
      updateAbilities(req);
    })
    .then(() => {
      res.status(200).send(req.user);
    })
    .catch((e) => {
      console.log(e);
      res.status(400).send();
    });
})

app.get('/home/:token', authenticate, (req,res) => {
  res.render('home.hbs',{
    name: req.user.name,
    token: req.user.tokens[0].token
  });
})

app.get('/deposit/:token', authenticate, (req,res) => {
  res.render('deposit.hbs',{
    name: req.user.name,
    token: req.user.tokens[0].token
  });
})

app.get('/logout/:token', authenticate, (req,res) => {
  var friends = new Friends(req.user);
  friends.removeToken(req.user.tokens[0].token).then((user) => {
    console.log(user);
    res.render('index.hbs');
  }).catch((e) => {
    res.status(400).send();
  })
})

app.listen(3000, () => {
  console.log('listening on port 3000...');
})

module.exports = {app};
