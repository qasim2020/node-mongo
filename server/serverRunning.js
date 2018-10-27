const {mongoose} = require('./../db/mongoose');
const {Jobs} = require('./../models/jobs');
const {Abilities} = require('./../models/abilities');
const {assignJob} = require('./assignJob');
const {sendEmail} = require('./sendEmail');

var serverRunning = () => {

  Jobs.find({status: 'pending'}).then((job) => {

    var unHandledRequest = job.find((el) => {
      // console.log(el);
      var storedDate = el._id.getTimestamp();
      var date = new Date();
      var diffInMillis = date - storedDate;
      return diffInMillis > 24 * 60 * 60 * 1000;
    });

    if (unHandledRequest) {
      Jobs.findOneAndUpdate({_id: unHandledRequest._id},{$set: {status: 'urgented'}},{new: true})
      .then((updatedJob) => {
        return sendEmail('qasimali24@gmail.com',`Qasim this job has been urgented, please check. <br><br>
        <b>id: ${updatedJob._id}</b><br>
        <b>request: ${updatedJob.request}</b><br>
        <b>status: ${updatedJob.status}</b><br>
        <b>raisedBy: ${updatedJob.raisedBy}</b><br>
        <b>last assigned to: ${updatedJob.assignedTo}</b><br>`,'Urgented');
        return setTimeout(() => serverRunning(),1000);
      }).catch((e) => {
        console.log(e);
        return setTimeout(() => serverRunning(),1000);
      });
    };

    var delayedBy60mins = job.find((el) => {
      var storedDate = el.assignedJobCounter;
      var date = new Date();
      var diffInMillis = date - storedDate;
      return diffInMillis > 60 * 60 * 1000;
    });

    if (delayedBy60mins) {
      Jobs.findOneAndUpdate({_id: delayedBy60mins._id},{$set: {assignedJobCounter: new Date().getTime().toString()}},{new: true})
      .then((updatedJob) => {
        console.log('====delayed by 60 mins====');
        return assignJob(updatedJob);
      }).then((jobAssigned) => {
        return setTimeout(() => serverRunning(),1000);
      }).catch((e) => {
        console.log(e);
        return setTimeout(() => serverRunning(),1000);
      })
    }

    return Abilities.find({jobStatus: /[1-9]/g});

  }).then((abilities) => {

    // immidiately capture the one with time more then 24 hours and change it to available
    var over24hours = abilities.find((el) => {
      // console.log(' ----- ');
      var storedDate = el.jobStatus;
      var date = new Date();
      var diffInMillis = date.getTime() - storedDate;
      // console.log(el.jobStatus, diffInMillis > 60 * 60 * 1000);
      return diffInMillis > 24 * 60 * 60 * 1000;
    });

    if (over24hours) {
      Abilities.findOneAndUpdate({_id: over24hours._id},{$set:{jobStatus: 'available'}},{new:true})
      .then((ability) => {
        console.log(ability);
        return setTimeout(() => serverRunning(),1000);
      })
      .catch((e) => {
        console.log(e);
        return setTimeout(() => serverRunning(),1000);
      })
    }

    return setTimeout(() => serverRunning(),1000);
  }).catch((e) => {
    console.log(e);
    return setTimeout(() => serverRunning(),1000);
  })

}

// checkDelayedRequests();
module.exports = {serverRunning};
