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
  jobRx = req.params.jobCredentials.split('q');
  assignedJobCounter = jobRx[0];
  assignedTo = jobRx[1];
  console.log('job Recieved',jobRx);
  if (!jobRx[1] || !jobRx[0]) {
    res.render('jobNotAvailable.hbs');
  };
  Jobs.findOne({assignedJobCounter}).then((job) => {
    req.job = job;
    var id = mongoose.Types.ObjectId(assignedTo);
    return Friends.findById(id);
  }).then((friend) => {
    req.assignedTo = friend;
    req.homeURL = url(req);
    if (!req.job) return Promise.reject('No job found with this job counter.');
    next();
  }).catch((e) => {
    console.log(e);
    res.render('jobNotAvailable.hbs',{
      homeURL: req.homeURL,
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
      req.abilities = abilities;
      next();
    }).catch((e) => {
      res.render('index.hbs');
    });
}

module.exports = {authenticate, customAuthenticate, jobAuthenticate, url};
