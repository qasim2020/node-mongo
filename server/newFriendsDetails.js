const {FriendsDetails} = require('./../models/friendsDetails');
const {mongoose} = require('./../db/mongoose');

var newFriendsDetails = (details) => {
  return new Promise((resolve,reject) => {
    var friendsDetails = new FriendsDetails(details);
    friendsDetails.save()
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e);
      });
  });
};

module.exports = {newFriendsDetails};
