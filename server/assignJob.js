const {mongoose} = require('./../db/mongoose');
const {Friends} = require('./../models/friends');
const {Abilities} = require('./../models/abilities');
const {Jobs} = require('./../models/jobs');
const {sendText} = require('./sendCode');

var assignJob = (job) => {

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
      return Friends.findOne(ability.refId);
    }).then((friend) => {
      if (!friend) return reject('Server: Friend Id not found, although it is registered.')
      got.friend = friend;
      var urlPair = {
        jobTo: got.friend._id.toHexString(),
        jobIs: job._id.toHexString(),
      };
      urlPair = encodeURIComponent(JSON.stringify(urlPair));
      var text = `Dear ${got.friend.name}, you can help someone in need. Please check details on below link:
      http://localhost:3000/newRequest/${urlPair}`;
      return sendText(text,got.friend.phone);
    }).then((status) => {
      if (!status) return reject(`text api didn't function properly`);
      return Jobs.findOneAndUpdate({_id: job._id},{$set:{assignedTo:got.friend._id.toHexString()}},{new: true});
    }).then((updatedJob) => {
      if (!got.ability) resolve(`given to Qasim`);
      return Abilities.findOneAndUpdate(got.ability._id,{
        $inc:{credit:-1},
        $set:{jobStatus: new Date().getTime().toString()}
      },{new: true})
    }).then((updatedAbility) => {
      if (!updatedAbility) reject('Ability was not updated with new credit value and jobStatus');
      resolve(updatedAbility);
    }).catch((e) => {
      console.log('***Job was not assigned.***');
      console.log(' ');
      got.error = e;
      return Jobs.findOneAndDelete({_id: job._id});
    }).then(() => {
      return reject(got.error);
    })

  });
};

module.exports = {assignJob};


// Friends.findOne({name: 'Qasim Ali', phone: /5168638/g});
