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
    var gotAbility, gotFriend, gotJob;

    Abilities.findOneAndUpdate(query,{$inc:{credit:-1}},{new: true}).then((ability) => {

      if (!ability) return Friends.findOne({name: 'Qasim Ali', phone: 923235168638});
      gotAbility = ability;
      return Friends.findById(ability.refId); //TODO: if credit is gt 0 then select this friend.

    }).then((friend) => {

      if (!friend) return reject('No friend found, id not found.');
      gotFriend = friend;
      return Jobs.findOneAndUpdate({_id: job._id},{$set:{assignedTo:friend._id.toHexString()}},{new: true});

    }).then((gotUpdatedJob) => {

      if (!gotUpdatedJob) return reject('Ability could not be uploaded with the assigned Friend Id.');
      gotJob = gotUpdatedJob;
      // TODO: text this person that you have been given the job;
      var urlPair = {
        jobTo: gotFriend._id.toHexString(),
        jobIs: gotJob._id.toHexString(),
      };
      urlPair = encodeURIComponent(JSON.stringify(urlPair));
      console.log(`
====Text message====
Dear ${gotFriend.name}, you can help someone in need. Please check details on below link:
http://localhost:3000/newRequest/${urlPair}
====================
      `);
      var text = `Dear ${gotFriend.name}, you can help someone in need. Please check details on below link:
      http://localhost:3000/newRequest/${urlPair}`;
      return sendText(text,gotFriend.phone);
    }).then(() => {
      return Abilities.findOneAndUpdate({refId: gotJob.assignedTo},{$set: {jobStatus: new Date().getTime().toString()}},{new: true});
    }).then((updatedAbility) => {

      var reply = {updatedAbility,gotFriend,gotJob};
      return resolve(reply);

    }).catch((e) => {

      console.log('*** something wrong happened while assigning job. ***');
      console.log(' ');
      return reject(e);

    });

  });
};

module.exports = {assignJob};


// Friends.findOne({name: 'Qasim Ali', phone: /5168638/g});
