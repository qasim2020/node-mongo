const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');

const {mongoose} = require('./db/mongoose');
const {Contacts} = require('./models/contacts');
const {Friends} = require('./models/friends');
const {Abilities} = require('./models/abilities');
const {authenticate} = require('./server/authenticate');
const {findContact} = require('./server/findRegex');

var app = express();
app.use(express.static(__dirname+'/static'));
app.use(bodyParser.json());
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine','hbs');

app.get('/',(req,res) => {
  res.render('index.hbs');
})

app.get('/login', authenticate, (req,res) => {
  res.render('login.hbs');
})

app.get('/check',(req,res) => {
  res.render('check.hbs');
})

app.post('/check/:data',(req,res) => {
  var {name,phone} = JSON.parse(req.params.data);
  findContact(name,phone).then((result) => {
    res.status(200).send(result);
  }).catch((e) => {
    res.status(401).send();
  });
});

app.get('/checkMobile/:id',authenticate,(req,res) => {
  res.render('checkMobile.hbs',{
    name: req.user.Name,
    phone: req.user.phone
  });
})

app.get('/signup', authenticate, (req,res) => {
  res.render('signup.hbs',{
    name: 'Qasim Ali',
    phone: '+923235168638'
  });
})

app.get('/willingess',authenticate,(req,res) => {
  res.render('willingness.hbs');
})

app.get('/home',authenticate,(req,res) => {
  res.render('home.hbs',{
    name: 'Qasim'
  });
})

app.get('/deposit',authenticate,(req,res) => {
  res.render('deposit.hbs',{
    name: 'Qasim'
  });
})

app.post('/testData/:data', (req,res) => {

})

app.listen(3000, () => {
  console.log('listening on port 3000...');
})

module.exports = {app};
