const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Friends} = require('./models/friends');
const {Abilities} = require('./models/abilities');

var app = express();
app.use(bodyParser.json());

app.post('/locals',(req,res) => {
  var afriend = new Friends({
    name: req.body.name,
    phone: req.body.phone,
    withMeAt: req.body.withMeAt,
    memorableOccasionWithMe: req.body.memorableOccasionWithMe,
    currentAddress: req.body.currentAddress,
    availForHelp: req.body.availForHelp
  });

  afriend.save().then((doc) => {
    res.status(200).send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(3000, () => {
  console.log('listening on port 3000...');
})
