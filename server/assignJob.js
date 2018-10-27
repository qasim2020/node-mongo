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
      var text = `Hi, Aoa, ${got.friend.name}, you can help someone in need. Please check details on below link:
${shortUrl}

Regards, Have a bright day. !`;
      got.text = text;
      return sendText(text,got.friend.phone);
    }).then((status) => {
      if (!status) return reject(`text api didn't function properly`);
      return Jobs.findOneAndUpdate({_id: job._id},{$set:{assignedTo:got.friend._id.toHexString()}},{new: true});
    }).then((updatedJob) => {
      if (!got.ability) {
        console.log('sending email to Qasim');
        sendEmail('qasimali24@gmail.com',`Qasim no one is available. Please find time to look into it:- <br><br>
        <b>id: ${job._id}</b><br>
        <b>request: ${job.request}</b><br>
        <b>status: ${job.status}</b><br>
        <b>raisedBy: ${job.raisedBy}</b><br>
        <b>last assigned to: ${job.assignedTo}</b><br>`,'NO ONE FOUND');
        return resolve('given to Qasim');
      }
      return Abilities.findOneAndUpdate({_id: got.ability._id},{
        $set:{jobStatus: new Date().getTime().toString()}
      },{new: true})
    }).then((updatedAbility) => {
      got.updatedAbility = updatedAbility;
      if (!updatedAbility) return reject('Ability was not updated with new credit value and jobStatus');
      return resolve(updatedAbility);
    }).catch((e) => {
      console.log('***Job was not assigned.***');
      console.log(' ');
      return reject(e);
    });

  });

};

module.exports = {assignJob};
