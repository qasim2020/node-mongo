const {mongoose} = require('./../db/mongoose');
const {Friends} = require('./../models/friends');
const {Abilities} = require('./../models/abilities');
const {Jobs} = require('./../models/jobs');
const {sendText} = require('./sendCode');
const GoogleURL = require('google-url');
const axios = require('axios');
const {sendEmail} = require('./sendEmail');

var getGoogleUrl = (url) => {
  return new Promise((resolve,reject) => {

    axios({
      method:'post',
      url:`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.KEY_FIREBASE}`,
      data: {
        "dynamicLinkInfo": {
          "dynamicLinkDomain": "flag.page.link",
          "link": `${url}`
        },
        "suffix": {
            "option": "SHORT"
        }
      },
      responseType:'application/json'
    }).then((response) => {
        console.log(url, response.data.shortLink);
        resolve(response.data.shortLink);
    }).catch((e) => {
      console.log('********error*******');
      reject('an error occured performing firebase request');
    });
  });
};


var assignJob = (job) => {

  googleUrl = new GoogleURL();

  console.log(`
=====a new job is being assigned=====
    `,job);

  return new Promise((resolve,reject) => {

    var abilityNeeded = job.abilityNeeded;
    var query = {};
    query[abilityNeeded] = true;
    query.jobStatus = 'available';
    query.refId = {$ne: job.raisedBy};
    query.credit = {$gt: 0};
    // console.log(query);
    var got = {};

    Abilities.findOne(query).then((ability) => {
      if (!ability) return Friends.findOne({name: 'Qasim Ali', phone: 923235168638});
      got.ability = ability;
      return Friends.findById(ability.refId);
    }).then((friend) => {
      if (!friend) return reject('Server: Friend Id not found, although it is registered.')
      got.friend = friend;
      var url = `${process.env.URL_LINK}/newRequest/${job.assignedJobCounter}q${got.friend._id.toHexString()}`;
      return getGoogleUrl(url);
    }).then((shortUrl) => {
      var text = `Dear ${got.friend.name}, you can help someone in need. Please check details on below link:
${shortUrl}`;
      return sendEmail('qasimali24@gmail.com',text);
    }).then((text) => {
      return sendText(text,got.friend.phone);
    }).then((status) => {
      if (!status) return reject(`text api didn't function properly`);
      return Jobs.findOneAndUpdate({_id: job._id},{$set:{assignedTo:got.friend._id.toHexString()}},{new: true});
    }).then((updatedJob) => {
      if (!got.ability) return resolve(`given to Qasim`);
      return Abilities.findOneAndUpdate({_id: got.ability._id},{
        $inc:{credit:-1},
        $set:{jobStatus: new Date().getTime().toString()}
      },{new: true})
    }).then((updatedAbility) => {
      got.updatedAbility = updatedAbility;
      if (!updatedAbility) return reject('Ability was not updated with new credit value and jobStatus');
      console.log('******after assignment*******',got,'***************');
      return resolve(updatedAbility);
    }).catch((e) => {
      console.log('***Job was not assigned.***');
      console.log(' ');
      return reject(e);
    });

  });

};

module.exports = {assignJob};


// Friends.findOne({name: 'Qasim Ali', phone: /5168638/g});
