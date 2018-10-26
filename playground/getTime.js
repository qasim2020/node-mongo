// const {mongoose} = require('./../db/mongoose');
// const {Jobs} = require('./../models/jobs');
//
// var checkDelayedRequests = () => {
//
//   Jobs.find({status: 'pending'}).then((job) => {
//
//     var unHandledRequest = job.find((el) => {
//       var storedDate = el._id.getTimestamp();
//       var date = new Date();
//       var diffInMillis = date - storedDate;
//       return diffInMillis > 60 * 1000;
//     });
//
//     console.log(unHandledRequest);
//
//     if (unHandledRequest) {
//       return Jobs.updateOne({_id: unHandledRequest._id},{$set: {status: 'urgented'}},{new: true}).then((updatedJob) => {
//         // TODO: text Qasim to contact Initiator
//         return setTimeout(() => checkDelayedRequests(),1000);
//       });
//     };
//çççç√
//     return setTimeout(() => checkDelayedRequests(),1000);
//
//   }).catch((e) => {
//     console.log(e);
//   })
//
// }
//
// checkDelayedRequests();
// // module.exports = {checkDelayedRequests};
