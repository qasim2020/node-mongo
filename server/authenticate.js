const {mongoose} = require('./../db/mongoose');
const {Friends} = require('./../models/friends');
const {Jobs} = require('./../models/jobs');
const {Abilities} = require('./../models/abilities');

var customAuthenticate = (req,res,next) => {
  var data = decodeURIComponent(req.params.data);
  var data = JSON.parse(req.params.data);
  req.params.token = data.token;
  req.params.data = data;
  authenticate(req,res,next);
}

var jobAuthenticate = (req,res,next) => {
  urlPair = JSON.parse(decodeURIComponent(req.params.jobCredentials));
  if (!urlPair) return res.render('jobNotAvailable.hbs');
  Jobs.findOne({assignedTo: urlPair.jobTo, _id: urlPair.jobIs}).then((job) => {
    req.job = job;
    return Friends.findById(urlPair.jobTo);
  }).then((friend) => {
    req.assignedTo = friend;
    if (!req.job) return Promise.reject('No job found.');
    next();
  }).catch((e) => {
    console.log(e);
    res.render('jobNotAvailable.hbs',{
      homeURL: url(req),
    });
  });
}

var url = (req) => {
  if  (!req.assignedTo.tokens.length) return '';
  return `home/` + req.assignedTo.tokens[0].token;
};

var authenticate = (req,res,next) => {
  var inputToken = req.params.token;
  if (!inputToken) return res.status(401).send();
  Friends
    .findByToken(inputToken)
    .then((user) => {
      if (!user) return Promise.reject('No user');
      req.user = user;
      console.log('authenticated');
      return Abilities.findOne({refId: user._id});
    }).then((abilities) => {
      console.log(abilities);
      req.abilities = abilities;
      next();
    }).catch((e) => {
      res.render('index.hbs');
    });
}

module.exports = {authenticate, customAuthenticate, jobAuthenticate};
