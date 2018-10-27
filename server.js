require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Contacts} = require('./models/contacts');
const {Friends} = require('./models/friends');
const {Abilities} = require('./models/abilities');
const {FriendsDetails} = require('./models/friendsDetails');
const {Jobs} = require('./models/jobs');

const {authenticate, customAuthenticate, jobAuthenticate, url} = require('./server/authenticate');
const {findContact} = require('./server/findContact');
const {newContact} = require('./server/newContact');
const {sendCode} = require('./server/sendCode');
const {serverRunning} = require('./server/serverRunning');
const {assignJob} = require('./server/assignJob');

var app = express();
var port = process.env.PORT;
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
  var data = JSON.parse(decodeURIComponent(req.params.data));
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

app.post('/check/:data',(req,res) => {
  var {name,phone} = JSON.parse(decodeURIComponent(req.params.data));
  var phoneCode = Math.floor(1000 + Math.random() * 9000);
  req.user = {phone};
  sendCode(phoneCode,req)
    .then(() => {
      return findContact(name,phone);
    })
    .then((result) => {
      console.log(result);
      result.phoneCode = phoneCode;
      return newContact(result);
    })
    .then((resultWithToken) => {
      var user = _.pick(resultWithToken, ['name','phone','tokens']);
      res.status(200).send(user);
    })
    .catch((e) => {
      console.log(e);
      res.status(401).send(e);
    })
});

app.get('/checkCode/:data', customAuthenticate,(req,res) => {
  if (req.user.phoneCode === req.params.data.val) {
    return res.status(200).send('Matched the code');
  }
  res.status(401).send();
})

app.post('/checkResendCode/:token', authenticate,(req,res) => {
  var phoneCode = Math.floor(1000 + Math.random() * 9000);
  sendCode(phoneCode,req)
  .then(() => {
    return Friends.findOneAndUpdate({_id: req.user._id}, {$set: {phoneCode}}, {new: true});
  })
  .then((user) => {
    console.log(user);
    res.status(200).send('New code sent');
  })
  .catch((e) => {
    res.status(400).send('something bad happened');
  })
})

app.get('/signup/:token', authenticate, (req,res) => {
  res.render('signup.hbs',{
    name: req.user.name,
  });
})

app.post(`/signupData/:data`, customAuthenticate, (req,res) => {
  req.params.data.refId = req.user._id;
  var body = _.pick(req.params.data,['refId','password','withMeAt','memorableOccasionWithMe','currentAddress']);
  var friendsDetails = new FriendsDetails(body);
  Friends.findOneAndUpdate({_id: req.user._id},{$set: {registered: true}},{new: true})
  .then((updatedFriend) => {
    return friendsDetails.save();
  })
  .then((details) => {
    console.log(details);
    res.status(200).send(req.user);
  })
  .catch((e) => {
    console.log(e);
    res.status(401).send(e);
  })
})

app.get('/willingness/:token', authenticate, (req,res) => {
  Abilities.findOne({refId: req.user._id}).then((data) => {
    if (!data) return Promise.reject('No willingness data found');
    var checkboxFormatData = {};
    Object.keys(data.toJSON()).forEach(function(key) {
        var status = () => {
          if (data[key]) return 'checked';
          return '';
        };
        checkboxFormatData[key] = status();
    });
    return res.render('willingness.hbs',{data: checkboxFormatData});
  })
  .catch((e) => {
    console.log(e);
    res.render('willingness.hbs');
  });
})

app.post('/willingnessData/:data', customAuthenticate, (req,res) => {
  var body = _.pick(req.params.data,['speakEnglish','writeLetter','bookARoom','localTourGuide','ForeignTourGuide','canFight','importExport','creditCard','pptx','cryptoCurrency','doctor','listen'])
  body.refId = req.user._id;
  var options = {
    setDefaultsOnInsert: true,
    upsert: true,
  };
  Abilities.findOneAndUpdate({refId: req.user._id},body,options)
  .then((abilities) => {
    res.status(200).send(req.user);
  })
  .catch((e) => {
    console.log(e);
    res.status(400).send();
  });
})

app.get('/home/:token', authenticate, (req,res) => {

  if (req.user.requestRaised) {
    return Jobs.findOne({
      raisedBy: req.user._id.toHexString(),
      status: /pending|beingSolved/g
    }).then((requestis) => {
      if (!requestis) return Promise.reject('User is ticked with request but no request found');
      res.render('deposit.hbs',{
        name: req.user.name,
        token: req.user.tokens[0].token,
        request: requestis.request,
        abilityNeededElaborated: requestis.abilityNeededElaborated,
        timeStamp: requestis._id.getTimestamp().getTime(),
        status: requestis.status,
      });
    }).catch((e) => {
      console.log(e);
      res.status(401).send();
    })
  }

  else if (!req.user.registered) {
    console.log('not registered yet so directing to signup.hbs');
    return res.render('signup.hbs');
  }

  Jobs.findOne({assignedTo: req.user._id, status:/pending|beingSolved/g}).then((job) => {
    if (!job) return Promise.reject('no job assigned to this user');
    console.log(job);

    if (!req.abilities) req.abilities = {credit : 'Willingness'};

    res.render('home.hbs',{
      name: req.user.name,
      token: req.user.tokens[0].token,
      status: job.status,
      urlToJob: `${job.assignedJobCounter}q${job.assignedTo}`,
      credit: req.user.credit,
    });
  })

  .catch((e) => {
    console.log(e);

    if (!req.abilities) req.abilities = {credit : 'Willingness'};

    res.render('home.hbs',{
      name: req.user.name,
      token: req.user.tokens[0].token,
      status: 'no job is here',
      credit: req.user.credit,
    });
  })

})

app.post('/homeData/:data', customAuthenticate, (req,res) => {

  var body = _.pick(req.params.data, ['request','abilityNeeded', 'abilityNeededElaborated']);
  body.raisedBy = req.user._id;
  body.assignedJobCounter = new Date().getTime().toString();
  var job = new Jobs(body);
  job.save().then((gotJob) => {
    req.job = gotJob;
    return assignJob(gotJob);
  }).then((job) => {
    return Friends.findOneAndUpdate({_id: req.user._id}, {
      $set: {requestRaised: true},
      $inc: {credit: -1}
    }, {new: true})
  }).then((friend) => {
    return res.status(200).send('job was assigned properly.');
  }).catch((e) => {
    console.log(e);
    req.error = e;
    return Jobs.findOneAndDelete({_id: req.job._id});
  }).then(() => {
    return res.status(401).send(req.error);
  })

})

app.post('/finishRequest/:data', customAuthenticate, (req,res) => {
  var body = req.params.data;
  console.log(body.requestStatus);
  Friends.findOneAndUpdate({_id: req.user._id}, {$set: {requestRaised: false}}, {new: true})
  .then((friend) => {
    return Jobs.findOneAndUpdate({raisedBy: req.user._id, status: /pending|beingSolved/g}, {$set: {status: body.requestStatus}}, {new: true});
  })
  .then((job) => {
    res.status(200).send(job);
  })
  .catch((e) => {
    console.log(e);
    res.status(400).send();
  })
})

app.get('/logout/:token', authenticate, (req,res) => {
  Friends.findOneAndUpdate({_id:req.user._id},{$unset: {tokens:1}},{new:true}).then((user) => {
    res.render('index.hbs');
  }).catch((e) => {
    res.status(400).send();
  })
})

app.get('/newRequest/:jobCredentials',jobAuthenticate,(req,res) => {

  Friends.findOne({_id: req.job.raisedBy}).then((friend) => {
    console.log('====job requested by assignedTo====')

    res.render('job.hbs',{
      job: req.job._id.toHexString(),
      request: req.job.request,
      status: req.job.status,
      abilityNeeded: req.job.abilityNeededElaborated,
      raisedByName: friend.name,
      raisedByPhone: friend.phone,
      timeStamp: req.job._id.getTimestamp().getTime(),
      assignedTo: req.assignedTo.name,
      remainingTime: req.job.assignedJobCounter,
      homeURL: req.homeURL,
    });

  }).catch((e) => {
    console.log(e);
    res.render('jobNotAvailable.hbs',{
      homeURL: req.homeURL,
    });
  });

});

app.post('/newRequestActions/:data',(req,res) => {

  var data = JSON.parse(decodeURIComponent(req.params.data));

  if (data.action === 'beingSolved') {

    Jobs.findOneAndUpdate({
      $and: [ { _id: data.job }, { status: { $ne: 'solved' } }, {status: { $ne: 'cancelled' } } ]
    },{$set:{status:data.action}},{new:true})
    .then((job) => {
      if (!job) return Promise.reject('already solved or cancelled');
      return res.status(200).send('updated status to being solved');
    })
    .catch((e) => {
      console.log(e);
      return res.status(400).send(e);
    })

  } else if (data.action === 'assignToNext') {
    Jobs.findOneAndUpdate({
      $and: [ { _id: data.job }, { status: { $ne: 'solved' } }, {status: { $ne: 'cancelled' } } ]
    },{$set:{status: 'pending', assignedJobCounter:new Date().getTime()}},
      {new:true})
    .then((updatedJob) => {
      if (!updatedJob) return Promise.reject('already solved or cancelled');
      console.log('====nexted by assignedTo====');
      return assignJob(updatedJob);
    }).then((array) => {
      return res.status(200).send('assigned to next user');
    }).catch((e) => {
      console.log(e);
      return res.status(400).send(e);
    })

  }
})

serverRunning();

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
})

module.exports = {app};
